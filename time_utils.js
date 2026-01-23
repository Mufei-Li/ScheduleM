(function () {
    const isValidTime = (t) => {
        if (typeof t !== 'string') return false;
        const m = t.match(/^(\d{2}):(\d{2})$/);
        if (!m) return false;
        const h = Number(m[1]);
        const min = Number(m[2]);
        if (!Number.isFinite(h) || !Number.isFinite(min)) return false;
        if (h < 0 || h > 23) return false;
        if (min < 0 || min > 59) return false;
        return true;
    };

    const parseTimeToMinutes = (t) => {
        if (!isValidTime(t)) return null;
        const parts = t.split(':');
        const h = Number(parts[0]);
        const m = Number(parts[1]);
        return h * 60 + m;
    };

    const formatMinutes = (m) => {
        if (!Number.isFinite(m)) return null;
        if (m < 0 || m >= 24 * 60) return null;
        const h = Math.floor(m / 60);
        const mm = m % 60;
        return `${String(h).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
    };

    const addMinutesToTime = (t, delta) => {
        const base = parseTimeToMinutes(t);
        if (base === null || !Number.isFinite(delta)) return null;
        return formatMinutes(base + delta);
    };

    const diffTimeMinutes = (from, to) => {
        const a = parseTimeToMinutes(from);
        const b = parseTimeToMinutes(to);
        if (a === null || b === null) return null;
        return b - a;
    };

    const shiftSlots = (slots, indices, delta) => {
        if (!Array.isArray(slots)) return { ok: false, message: '时间设置无效' };
        const next = slots.map(s => ({ start: s.start, end: s.end }));
        for (const idx of indices) {
            if (!Number.isFinite(idx) || idx < 0 || idx >= next.length) {
                return { ok: false, message: '节次索引无效' };
            }
            const start = addMinutesToTime(next[idx].start, delta);
            const end = addMinutesToTime(next[idx].end, delta);
            if (!start || !end) return { ok: false, message: '时间超出范围' };
            next[idx] = { start, end };
        }
        return { ok: true, slots: next };
    };

    const validateSlots = (slots) => {
        if (!Array.isArray(slots) || slots.length === 0) {
            return { ok: false, message: '时间设置无效' };
        }
        for (let i = 0; i < slots.length; i++) {
            const s = slots[i];
            if (!s || !isValidTime(s.start) || !isValidTime(s.end)) {
                return { ok: false, message: `第${i + 1}节时间格式不正确` };
            }
            const sm = parseTimeToMinutes(s.start);
            const em = parseTimeToMinutes(s.end);
            if (sm >= em) {
                return { ok: false, message: `第${i + 1}节开始时间必须早于结束时间` };
            }
        }
        for (let i = 0; i < slots.length - 1; i++) {
            const curEnd = parseTimeToMinutes(slots[i].end);
            const nextStart = parseTimeToMinutes(slots[i + 1].start);
            if (curEnd > nextStart) {
                return { ok: false, message: `第${i + 1}节与第${i + 2}节时间冲突` };
            }
        }
        return { ok: true };
    };

    const computeShiftedSlots = (baseSlots, idx, type, newValue, opts) => {
        if (!Array.isArray(baseSlots) || baseSlots.length === 0) {
            return { ok: false, message: '时间设置无效' };
        }
        if (!Number.isFinite(idx) || idx < 0 || idx >= baseSlots.length) {
            return { ok: false, message: '节次索引无效' };
        }
        if (type !== 'start' && type !== 'end') {
            return { ok: false, message: '时间字段无效' };
        }
        if (!isValidTime(newValue)) {
            return { ok: false, message: '时间格式不正确' };
        }

        const firstDuration = opts && Number.isFinite(opts.firstDuration) ? Number(opts.firstDuration) : 45;
        const maxIndex = opts && Number.isFinite(opts.maxIndex) ? Number(opts.maxIndex) : baseSlots.length - 1;
        const mins = baseSlots.map((slot, i) => {
            if (!slot || !isValidTime(slot.start) || !isValidTime(slot.end)) return null;
            const start = parseTimeToMinutes(slot.start);
            const end = parseTimeToMinutes(slot.end);
            if (start === null || end === null) return null;
            return { start, end, i };
        });

        if (mins.some(m => !m)) return { ok: false, message: '时间设置无效' };

        const next = mins.map(m => ({ start: m.start, end: m.end }));
        const newMin = parseTimeToMinutes(newValue);

        if (type === 'start') {
            const duration = idx === 0 ? firstDuration : (mins[idx].end - mins[idx].start);
            if (!Number.isFinite(duration) || duration <= 0) {
                return { ok: false, message: '课程时长无效' };
            }
            const newEnd = newMin + duration;
            if (newEnd <= newMin || newEnd >= 24 * 60) {
                return { ok: false, message: '时间超出范围' };
            }
            next[idx] = { start: newMin, end: newEnd };
        } else {
            const start = mins[idx].start;
            if (newMin <= start || newMin >= 24 * 60) {
                return { ok: false, message: '结束时间无效' };
            }
            next[idx] = { start, end: newMin };
        }

        for (let i = idx + 1; i < mins.length && i <= maxIndex; i++) {
            const gap = mins[i].start - mins[i - 1].end;
            if (!Number.isFinite(gap)) return { ok: false, message: '课间设置无效' };
            const duration = mins[i].end - mins[i].start;
            if (!Number.isFinite(duration) || duration <= 0) {
                return { ok: false, message: '课程时长无效' };
            }
            const newStart = next[i - 1].end + gap;
            const newEnd = newStart + duration;
            if (newStart < 0 || newEnd >= 24 * 60) {
                return { ok: false, message: '时间超出范围' };
            }
            next[i] = { start: newStart, end: newEnd };
        }

        const slots = next.map(s => ({ start: formatMinutes(s.start), end: formatMinutes(s.end) }));
        const validation = validateSlots(slots);
        if (!validation.ok) return validation;
        return { ok: true, slots };
    };

    const api = {
        isValidTime,
        parseTimeToMinutes,
        formatMinutes,
        addMinutesToTime,
        diffTimeMinutes,
        shiftSlots,
        validateSlots,
        computeShiftedSlots
    };

    if (typeof window !== 'undefined') {
        window.ScheduleLLMTimeUtils = api;
    }
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = api;
    }
})();