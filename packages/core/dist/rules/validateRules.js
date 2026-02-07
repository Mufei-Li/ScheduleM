"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateCourseRules = void 0;
const timeUtils_1 = require("../time/timeUtils");
const normalizeRule_1 = require("./normalizeRule");
const standardizeLocation_1 = require("./standardizeLocation");
const validateCourseRules = (rules, currentSlots) => {
    // Basic dependency check omitted as we import them directly
    const arr = Array.isArray(rules) ? rules : [];
    const bySlot = new Map();
    for (const r of arr) {
        const norm = (0, normalizeRule_1.normalizeCourseRuleInput)(r, currentSlots);
        if (!norm.ok || !norm.rule)
            return { ok: false, message: norm.message };
        const rule = norm.rule;
        const tr = (0, timeUtils_1.getTimeRangeForPeriod)(currentSlots, rule.periodRange, null);
        if (!tr)
            return { ok: false, message: `课程“${rule.name}”节次时间无效` };
        const sMin = (0, timeUtils_1.parseTimeToMinutes)(tr.startTime);
        const eMin = (0, timeUtils_1.parseTimeToMinutes)(tr.endTime);
        if (sMin == null || eMin == null || eMin <= sMin)
            return { ok: false, message: `课程“${rule.name}”时间无效` };
        const loc = (0, standardizeLocation_1.standardizeLocation)(rule.location).location;
        for (const wk of rule.weeks) {
            const key = `${wk}-${rule.dayOfWeek}`;
            if (!bySlot.has(key))
                bySlot.set(key, []);
            bySlot.get(key).push({
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
    const warnings = [];
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
exports.validateCourseRules = validateCourseRules;
