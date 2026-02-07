import { CourseRule, CalendarEvent, TimeSlot } from '../types';
import { getTimeRangeForPeriod } from '../time/timeUtils';
import { normalizeCourseRuleInput } from '../rules/normalizeRule';

export const generateEvents = (
    rules: Partial<CourseRule>[],
    semesterStart: Date,
    currentSlots: TimeSlot[]
): CalendarEvent[] => {
    if (!semesterStart || !(semesterStart instanceof Date) || !Number.isFinite(semesterStart.getTime())) {
        return [];
    }

    const out: CalendarEvent[] = [];
    const arr = Array.isArray(rules) ? rules : [];

    for (const r0 of arr) {
        const norm = normalizeCourseRuleInput(r0, currentSlots);
        if (!norm.ok || !norm.rule) continue;
        const r = norm.rule;

        const tr = getTimeRangeForPeriod(currentSlots, r.periodRange, null);
        if (!tr) continue;

        const periodNum = tr.startPeriod;
        let timeOfDay: 'morning' | 'afternoon' | 'evening' = 'morning';
        if (periodNum >= 5 && periodNum <= 8) timeOfDay = 'afternoon';
        if (periodNum >= 9) timeOfDay = 'evening';

        for (const weekNum of r.weeks) {
            const daysToAdd = (weekNum - 1) * 7 + (r.dayOfWeek - 1);
            const targetDate = new Date(semesterStart);
            targetDate.setDate(semesterStart.getDate() + daysToAdd);

            out.push({
                title: r.name,
                rawTitle: r.rawName,
                location: r.location || '—',
                className: r.className || '',
                weeks: r.weeks,
                periodRange: r.periodRange,
                startTime: tr.startTime,
                endTime: tr.endTime,
                date: targetDate,
                week: weekNum,
                period: periodNum,
                dayOfWeek: r.dayOfWeek,
                timeOfDay: timeOfDay,
                description: `课程: ${r.rawName || r.name}\n地点: ${r.location || '—'}\n周次: ${weekNum}周\n班级: ${r.className || ''}`
            });
        }
    }

    out.sort((a, b) => {
        const ta = a.date.getTime();
        const tb = b.date.getTime();
        if (ta !== tb) return ta - tb;
        if ((a.period || 0) !== (b.period || 0)) return (a.period || 0) - (b.period || 0);
        return String(a.title || '').localeCompare(String(b.title || ''), 'zh');
    });

    return out;
};
