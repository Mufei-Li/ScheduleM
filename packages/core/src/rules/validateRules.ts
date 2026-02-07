import { CourseRule, TimeSlot } from '../types';
import { getTimeRangeForPeriod, parseTimeToMinutes } from '../time/timeUtils';
import { normalizeCourseRuleInput } from './normalizeRule';
import { standardizeLocation } from './standardizeLocation';

export interface ValidationWarning {
    week: string;
    day: number;
    dayLabel: string;
    a: string;
    b: string;
    location: string;
}

export interface ValidationResult {
    ok: boolean;
    message?: string;
    warnings?: ValidationWarning[];
}

export const validateCourseRules = (rules: Partial<CourseRule>[], currentSlots: TimeSlot[]): ValidationResult => {
    // Basic dependency check omitted as we import them directly

    const arr = Array.isArray(rules) ? rules : [];
    
    interface SlotItem {
        name: string;
        startMin: number;
        endMin: number;
        week: number;
        day: number;
        location: string;
        startPeriod: number;
        endPeriod: number;
    }

    const bySlot = new Map<string, SlotItem[]>();
    
    for (const r of arr) {
        const norm = normalizeCourseRuleInput(r, currentSlots);
        if (!norm.ok || !norm.rule) return { ok: false, message: norm.message };

        const rule = norm.rule;
        const tr = getTimeRangeForPeriod(currentSlots, rule.periodRange, null);
        if (!tr) return { ok: false, message: `课程“${rule.name}”节次时间无效` };

        const sMin = parseTimeToMinutes(tr.startTime);
        const eMin = parseTimeToMinutes(tr.endTime);
        if (sMin == null || eMin == null || eMin <= sMin) return { ok: false, message: `课程“${rule.name}”时间无效` };

        const loc = standardizeLocation(rule.location).location;

        for (const wk of rule.weeks) {
            const key = `${wk}-${rule.dayOfWeek}`;
            if (!bySlot.has(key)) bySlot.set(key, []);
            bySlot.get(key)!.push({
                name: rule.name,
                startMin: sMin,
                endMin: eMin,
                week: wk,
                day: rule.dayOfWeek,
                location: loc,
                startPeriod: tr.startPeriod,
                endPeriod: tr.endPeriod
            });
        }
    }

    const warnings: ValidationWarning[] = [];

    for (const [key, list] of bySlot.entries()) {
        const items = list.slice().sort((a, b) => a.startMin - b.startMin);
        for (let i = 1; i < items.length; i++) {
            const prev = items[i - 1];
            const cur = items[i];
            if (cur.startMin < prev.endMin) {
                const parts = key.split('-');
                const wk = parts[0];
                const day = parseInt(parts[1], 10);
                const dayLabel = ['', '周一', '周二', '周三', '周四', '周五', '周六', '周日'][day] || '';

                const sameTime = cur.startMin === prev.startMin && cur.endMin === prev.endMin;
                const sameLoc = String(cur.location || '') === String(prev.location || '');
                const samePeriod = (cur.startPeriod === prev.startPeriod) && (cur.endPeriod === prev.endPeriod);

                if (sameTime && sameLoc && samePeriod) {
                    warnings.push({ week: wk, day, dayLabel, a: prev.name, b: cur.name, location: cur.location });
                    continue;
                }

                return { ok: false, message: `存在时间冲突：第${wk}周${dayLabel}“${prev.name}”与“${cur.name}”时间重叠` };
            }
        }
    }

    return warnings.length > 0 ? { ok: true, warnings } : { ok: true };
};
