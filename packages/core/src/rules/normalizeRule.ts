import { CourseRule, TimeSlot } from '../types';
import { 
    sanitizePeriodRange, 
    parseWeekString, 
    formatWeekRanges, 
    getTimeRangeForPeriod 
} from '../time/timeUtils';

// Helper: Generates a unique ID (compatible with browser/node)
export const generateId = (): string => {
    if (typeof crypto !== 'undefined' && crypto && typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID();
    }
    return `id_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
};

const parseNumList = (s: string, maxWeek: number): number[] => {
    if (!s) return [];
    const set = new Set<number>();
    s.split(/[,，]/).forEach(part => {
        const p = String(part || '').trim();
        if (!p) return;
        const mRange = p.match(/^(\d+)\s*-\s*(\d+)$/);
        if (mRange) {
            let a = parseInt(mRange[1], 10);
            let b = parseInt(mRange[2], 10);
            if (!Number.isFinite(a) || !Number.isFinite(b)) return;
            if (a <= 0 || a > maxWeek || b <= 0 || b > maxWeek) return;
            if (b < a) b = a;
            for (let i = a; i <= b; i++) set.add(i);
            return;
        }
        if (/^\d+$/.test(p)) {
            const n = parseInt(p, 10);
            if (Number.isFinite(n) && n > 0 && n <= maxWeek) set.add(n);
        }
    });
    return Array.from(set).sort((a, b) => a - b);
};

export const parseWeeksForEditor = (weeksRaw: string): number[] => {
    const raw = String(weeksRaw || '').trim();
    if (!raw) return [];

    const maxWeek = 50;

    const parsed = parseWeekString(raw, { maxWeek });
    if (parsed && parsed.length > 0) {
        const hasComma = /[,，]/.test(raw);
        const weekMarkCount = (raw.match(/[周Ww]/g) || []).length;

        if (hasComma && weekMarkCount === 1) {
            const stripped = raw.replace(/^\s*第\s*/g, '').replace(/\s*周\s*$/g, '');
            if (stripped && stripped !== raw && /[,，]/.test(stripped) && /^[\d\s,，\-]+$/.test(stripped)) {
                const alt = parseNumList(stripped, maxWeek);
                if (alt.length > parsed.length) return alt;
            }
        }

        return parsed;
    }

    const stripped = raw.replace(/^\s*第\s*/g, '').replace(/\s*周\s*$/g, '');
    if (stripped && stripped !== raw) {
        if (/^\s*\d+\s*(?:[,，]\s*\d+\s*)+$/.test(stripped)) {
            const nums = stripped
                .split(/[,，]/)
                .map(x => parseInt(String(x).trim(), 10))
                .filter(n => Number.isFinite(n) && n > 0 && n <= maxWeek);
            return Array.from(new Set(nums)).sort((a, b) => a - b);
        }
        if (/[,，]/.test(stripped) && /^[\d\s,，\-]+$/.test(stripped)) {
            return parseNumList(stripped, maxWeek);
        }
    }

    if (/^\s*\d+\s*(?:[,，]\s*\d+\s*)+$/.test(raw)) {
        const nums = raw
            .split(/[,，]/)
            .map(x => parseInt(String(x).trim(), 10))
            .filter(n => Number.isFinite(n) && n > 0 && n <= maxWeek);
        return Array.from(new Set(nums)).sort((a, b) => a - b);
    }

    if (/[,，]/.test(raw) && /^[\d\s,，\-]+$/.test(raw)) {
        return parseNumList(raw, maxWeek);
    }

    return [];
};

export interface NormalizeResult {
    ok: boolean;
    message?: string;
    rule?: CourseRule;
}

export const normalizeCourseRuleInput = (input: Partial<CourseRule>, currentSlots: TimeSlot[]): NormalizeResult => {
    const raw = input && typeof input === 'object' ? input : {};

    const name = raw.name ? String(raw.name).trim() : '';
    if (!name) return { ok: false, message: '课程名称不能为空' };

    const dayOfWeek = parseInt(String(raw.dayOfWeek), 10);
    if (!Number.isFinite(dayOfWeek) || dayOfWeek < 1 || dayOfWeek > 7) return { ok: false, message: '星期信息无效' };

    // @ts-ignore - raw input might have period instead of periodRange
    const periodSeed = (raw.periodRange != null && String(raw.periodRange).trim())
        ? String(raw.periodRange)
        // @ts-ignore
        : (raw.period != null ? String(raw.period) : '');
    const periodRange = sanitizePeriodRange(periodSeed);
    if (!periodRange) return { ok: false, message: '节次不能为空' };

    const weeksRawInput = raw.weeksRaw ? String(raw.weeksRaw).trim() : '';
    const weeksFromRaw = weeksRawInput ? parseWeeksForEditor(weeksRawInput) : [];

    const weeksFromArr = Array.isArray(raw.weeks)
        ? raw.weeks
            .map(n => parseInt(String(n).trim(), 10))
            .filter(n => Number.isFinite(n) && n > 0 && n <= 50)
        : [];

    const weeksArrDedup = Array.from(new Set(weeksFromArr)).sort((a, b) => a - b);

    // Prioritize existing weeks array if it has more info (avoid losing weeks on re-save)
    const weeks = (weeksArrDedup.length > 0 && weeksArrDedup.length > (weeksFromRaw ? weeksFromRaw.length : 0))
        ? weeksArrDedup
        : (weeksFromRaw && weeksFromRaw.length > 0 ? weeksFromRaw : weeksArrDedup);

    if (!weeks || weeks.length === 0) return { ok: false, message: '周次不能为空或格式不正确' };

    const weeksRaw = weeksRawInput || formatWeekRanges(weeks);

    const timeRange = getTimeRangeForPeriod(currentSlots, periodRange, null);
    if (!timeRange) return { ok: false, message: '节次时间无效，请检查节次时间设置' };

    return {
        ok: true,
        rule: {
            id: raw.id ? String(raw.id) : generateId(),
            name,
            rawName: raw.rawName ? String(raw.rawName) : name,
            location: raw.location ? String(raw.location).trim() : '',
            className: raw.className ? String(raw.className).trim() : '',
            dayOfWeek,
            periodRange,
            weeksRaw,
            weeks,
            source: raw.source === 'manual' ? 'manual' : 'auto',
            createdAt: Number.isFinite(Number(raw.createdAt)) ? Number(raw.createdAt) : (raw.source === 'manual' ? Date.now() : 0)
        }
    };
};
