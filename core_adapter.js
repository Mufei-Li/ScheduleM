(() => {
  var __defProp = Object.defineProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };

  // packages/core/src/time/timeUtils.ts
  var timeUtils_exports = {};
  __export(timeUtils_exports, {
    addMinutesToTime: () => addMinutesToTime,
    computeShiftedSlots: () => computeShiftedSlots,
    diffTimeMinutes: () => diffTimeMinutes,
    formatClassAndWeeksLines: () => formatClassAndWeeksLines,
    formatMinutes: () => formatMinutes,
    formatWeekRanges: () => formatWeekRanges,
    getPeriodBounds: () => getPeriodBounds,
    getTimeRangeForPeriod: () => getTimeRangeForPeriod,
    icsEscapeText: () => icsEscapeText,
    icsFoldLine: () => icsFoldLine,
    isValidTime: () => isValidTime,
    normalizeWeekParityToken: () => normalizeWeekParityToken,
    parseTimeToMinutes: () => parseTimeToMinutes,
    parseWeekString: () => parseWeekString,
    sanitizePeriodRange: () => sanitizePeriodRange,
    shiftSlots: () => shiftSlots,
    validateSlots: () => validateSlots
  });
  var isValidTime = (t) => {
    if (typeof t !== "string") return false;
    const m = t.match(/^(\d{2}):(\d{2})$/);
    if (!m) return false;
    const h = Number(m[1]);
    const min = Number(m[2]);
    if (!Number.isFinite(h) || !Number.isFinite(min)) return false;
    if (h < 0 || h > 23) return false;
    if (min < 0 || min > 59) return false;
    return true;
  };
  var parseTimeToMinutes = (t) => {
    if (!isValidTime(t)) return null;
    const parts = t.split(":");
    const h = Number(parts[0]);
    const m = Number(parts[1]);
    return h * 60 + m;
  };
  var formatMinutes = (m) => {
    if (!Number.isFinite(m)) return null;
    if (m < 0 || m >= 24 * 60) return null;
    const h = Math.floor(m / 60);
    const mm = m % 60;
    return `${String(h).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
  };
  var addMinutesToTime = (t, delta) => {
    const base = parseTimeToMinutes(t);
    if (base === null || !Number.isFinite(delta)) return null;
    const res = base + delta;
    return formatMinutes(res);
  };
  var diffTimeMinutes = (from, to) => {
    const a = parseTimeToMinutes(from);
    const b = parseTimeToMinutes(to);
    if (a === null || b === null) return null;
    return b - a;
  };
  var shiftSlots = (slots, indices, delta) => {
    if (!Array.isArray(slots)) return { ok: false, message: "\u65F6\u95F4\u8BBE\u7F6E\u65E0\u6548" };
    const next = slots.map((s) => ({ start: s.start, end: s.end }));
    for (const idx of indices) {
      if (!Number.isFinite(idx) || idx < 0 || idx >= next.length) {
        return { ok: false, message: "\u8282\u6B21\u7D22\u5F15\u65E0\u6548" };
      }
      const start = addMinutesToTime(next[idx].start, delta);
      const end = addMinutesToTime(next[idx].end, delta);
      if (!start || !end) return { ok: false, message: "\u65F6\u95F4\u8D85\u51FA\u8303\u56F4" };
      next[idx] = { start, end };
    }
    return { ok: true, slots: next };
  };
  var validateSlots = (slots) => {
    if (!Array.isArray(slots) || slots.length === 0) {
      return { ok: false, message: "\u65F6\u95F4\u8BBE\u7F6E\u65E0\u6548" };
    }
    for (let i = 0; i < slots.length; i++) {
      const s = slots[i];
      if (!s || !isValidTime(s.start) || !isValidTime(s.end)) {
        return { ok: false, message: `\u7B2C${i + 1}\u8282\u65F6\u95F4\u683C\u5F0F\u4E0D\u6B63\u786E` };
      }
      const sm = parseTimeToMinutes(s.start);
      const em = parseTimeToMinutes(s.end);
      if (sm !== null && em !== null && sm >= em) {
        return { ok: false, message: `\u7B2C${i + 1}\u8282\u5F00\u59CB\u65F6\u95F4\u5FC5\u987B\u65E9\u4E8E\u7ED3\u675F\u65F6\u95F4` };
      }
    }
    for (let i = 0; i < slots.length - 1; i++) {
      const curEnd = parseTimeToMinutes(slots[i].end);
      const nextStart = parseTimeToMinutes(slots[i + 1].start);
      if (curEnd !== null && nextStart !== null && curEnd > nextStart) {
        return { ok: false, message: `\u7B2C${i + 1}\u8282\u4E0E\u7B2C${i + 2}\u8282\u65F6\u95F4\u51B2\u7A81` };
      }
    }
    return { ok: true };
  };
  var computeShiftedSlots = (baseSlots, idx, type, newValue, opts) => {
    if (!Array.isArray(baseSlots) || baseSlots.length === 0) {
      return { ok: false, message: "\u65F6\u95F4\u8BBE\u7F6E\u65E0\u6548" };
    }
    if (!Number.isFinite(idx) || idx < 0 || idx >= baseSlots.length) {
      return { ok: false, message: "\u8282\u6B21\u7D22\u5F15\u65E0\u6548" };
    }
    if (type !== "start" && type !== "end") {
      return { ok: false, message: "\u65F6\u95F4\u5B57\u6BB5\u65E0\u6548" };
    }
    if (!isValidTime(newValue)) {
      return { ok: false, message: "\u65F6\u95F4\u683C\u5F0F\u4E0D\u6B63\u786E" };
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
    if (mins.some((m) => !m)) return { ok: false, message: "\u65F6\u95F4\u8BBE\u7F6E\u65E0\u6548" };
    const nextMins = mins.map((m) => ({ start: m.start, end: m.end }));
    const newMin = parseTimeToMinutes(newValue);
    if (newMin === null) return { ok: false, message: "\u65F6\u95F4\u683C\u5F0F\u4E0D\u6B63\u786E" };
    if (type === "start") {
      const duration = idx === 0 ? firstDuration : nextMins[idx].end - nextMins[idx].start;
      if (!Number.isFinite(duration) || duration <= 0) {
        return { ok: false, message: "\u8BFE\u7A0B\u65F6\u957F\u65E0\u6548" };
      }
      const newEnd = newMin + duration;
      if (newEnd <= newMin || newEnd >= 24 * 60) {
        return { ok: false, message: "\u65F6\u95F4\u8D85\u51FA\u8303\u56F4" };
      }
      nextMins[idx] = { start: newMin, end: newEnd };
    } else {
      const start = nextMins[idx].start;
      if (newMin <= start || newMin >= 24 * 60) {
        return { ok: false, message: "\u7ED3\u675F\u65F6\u95F4\u65E0\u6548" };
      }
      nextMins[idx] = { start, end: newMin };
    }
    for (let i = idx + 1; i < nextMins.length && i <= maxIndex; i++) {
      const gap = mins[i].start - mins[i - 1].end;
      if (!Number.isFinite(gap)) return { ok: false, message: "\u8BFE\u95F4\u8BBE\u7F6E\u65E0\u6548" };
      const duration = mins[i].end - mins[i].start;
      if (!Number.isFinite(duration) || duration <= 0) {
        return { ok: false, message: "\u8BFE\u7A0B\u65F6\u957F\u65E0\u6548" };
      }
      const newStart = nextMins[i - 1].end + gap;
      const newEnd = newStart + duration;
      if (newStart < 0 || newEnd >= 24 * 60) {
        return { ok: false, message: "\u65F6\u95F4\u8D85\u51FA\u8303\u56F4" };
      }
      nextMins[i] = { start: newStart, end: newEnd };
    }
    const nextSlots = nextMins.map((s) => {
      const start = formatMinutes(s.start);
      const end = formatMinutes(s.end);
      return { start: start || "00:00", end: end || "00:00" };
    });
    const validation = validateSlots(nextSlots);
    if (!validation.ok) return validation;
    return { ok: true, slots: nextSlots };
  };
  var sanitizePeriodRange = (periodRange) => {
    if (!periodRange) return "";
    const raw = String(periodRange).trim();
    if (!raw) return "";
    let s = raw.replace(/[（(]/g, "").replace(/[）)]/g, "").replace(/[节课]/g, "").replace(/第/g, "").replace(/[~～—–−]/g, "-").replace(/至/g, "-").replace(/[，、;；]/g, ",");
    const parts = s.split(",").map((x) => x.trim()).filter(Boolean);
    if (!parts.length) parts.push(s);
    const toP = (n) => {
      const v = parseInt(n, 10);
      if (!Number.isFinite(v)) return 1;
      return v >= 1 ? v : 1;
    };
    const normParts = parts.map((part) => {
      const mRange = String(part).match(/(\d+)\s*-\s*(\d+)/);
      if (mRange) {
        const a0 = toP(mRange[1]);
        let b0 = toP(mRange[2]);
        if (b0 < a0) b0 = a0;
        return a0 === b0 ? String(a0) : `${a0}-${b0}`;
      }
      const mSingle = String(part).match(/(\d+)/);
      if (mSingle) return String(toP(mSingle[1]));
      return part;
    });
    return normParts.join(",");
  };
  var normalizeOCRText = (str) => {
    if (!str) return "";
    return String(str).replace(/[０-９]/g, (d) => String.fromCharCode(d.charCodeAt(0) - 65248)).replace(/[Ａ-Ｚａ-ｚ]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 65248)).replace(/（/g, "(").replace(/）/g, ")").replace(/：/g, ":").replace(/[—－]/g, "-").replace(/[~～—–−]/g, "-").replace(/(\d+)\s*[\n\r]*[-~～]\s*[\n\r]*\s*(\d+)/g, "$1-$2").replace(/(\d+)\s*[\n\r]+\s*(\d+)/g, "$1$2").trim();
  };
  var editDistance = (a, b) => {
    const s = String(a == null ? "" : a);
    const t = String(b == null ? "" : b);
    const n = s.length;
    const m = t.length;
    if (n === 0) return m;
    if (m === 0) return n;
    const dp = new Array(m + 1);
    for (let j = 0; j <= m; j++) dp[j] = j;
    for (let i = 1; i <= n; i++) {
      let prev = dp[0];
      dp[0] = i;
      for (let j = 1; j <= m; j++) {
        const tmp = dp[j];
        const cost = s[i - 1] === t[j - 1] ? 0 : 1;
        dp[j] = Math.min(
          dp[j] + 1,
          dp[j - 1] + 1,
          prev + cost
        );
        prev = tmp;
      }
    }
    return dp[m];
  };
  var normalizeWeekParityToken = (raw) => {
    const t0 = String(raw || "").replace(/[()（）\s]/g, "");
    if (!t0) return null;
    if (/[单双]/.test(t0)) return t0.includes("\u53CC") ? "\u53CC" : "\u5355";
    if (/奇/.test(t0)) return "\u5355";
    if (/偶/.test(t0)) return "\u53CC";
    if (/^(?:单周|奇周)$/i.test(t0)) return "\u5355";
    if (/^(?:双周|偶周)$/i.test(t0)) return "\u53CC";
    if (/^[1一I|l]+$/.test(t0)) return "\u5355";
    if (/^[2二Zz]+$/.test(t0)) return "\u53CC";
    if (t0 === "\u65E6" || t0 === "\u65E9" || t0 === "\u7532") return "\u5355";
    if (t0 === "\u53C8" || t0 === "\u53C9" || t0 === "\u5BF9") return "\u53CC";
    if (/^[xX×✕✖]{2,}$/.test(t0)) return "\u53CC";
    if (t0 === "XX" || t0 === "xx") return "\u53CC";
    if (/^[单双奇偶旦又叉对甲早xX×✕✖1I|l一二2Zz]{1,4}$/.test(t0)) {
      const candidates = [
        { k: "\u5355", v: "\u5355" },
        { k: "\u53CC", v: "\u53CC" },
        { k: "\u5947", v: "\u5355" },
        { k: "\u5076", v: "\u53CC" },
        { k: "\u5355\u5468", v: "\u5355" },
        { k: "\u53CC\u5468", v: "\u53CC" },
        { k: "\u5947\u5468", v: "\u5355" },
        { k: "\u5076\u5468", v: "\u53CC" }
      ];
      let best = null;
      for (const c of candidates) {
        const d = editDistance(t0, c.k);
        if (!best || d < best.d) best = { d, v: c.v };
      }
      if (best && best.d <= 1) return best.v;
    }
    return null;
  };
  var parseWeekString = (str, opts) => {
    if (!str) return [];
    const maxWeek = opts && Number.isFinite(opts.maxWeek) ? Number(opts.maxWeek) : 30;
    let cleanStr = normalizeOCRText(str);
    cleanStr = cleanStr.replace(/\([^)]*节\)/g, "");
    cleanStr = cleanStr.replace(/(\d+(?:\s*[-~～—–−]\s*\d+)?)\s*周\s*([^\d,，()（）\s]{1,4})(?=[,，\s]|$)/g, "$1\u5468($2)").replace(/(\d+(?:\s*[-~～—–−]\s*\d+)?)\s*周\s*(单|双)(?=[,，\s]|$)/g, "$1\u5468($2)").replace(/(\d+(?:\s*[-~～—–−]\s*\d+)?)\s*(单周|双周|奇周|偶周)(?=[,，\s]|$)/g, (_, a, b) => {
      const p = normalizeWeekParityToken(b);
      return p ? `${a}\u5468(${p})` : `${a}\u5468`;
    });
    const parts = cleanStr.split(/[,，]/);
    const weekSet = /* @__PURE__ */ new Set();
    for (const part0 of parts) {
      const part = String(part0 || "");
      const weekRe = /(\d+)(?:\s*[-~～—–−]\s*(\d+))?(?:周|W|w)?(?:\s*[\(（]\s*([^\)）]{1,8})\s*[\)）])?/g;
      let match;
      while ((match = weekRe.exec(part)) !== null) {
        if (!match[0]) continue;
        const token = match[0];
        const hasWeekMark = /[周Ww]/.test(token);
        const hasRange = !!match[2];
        if (!hasWeekMark && !hasRange) continue;
        const start = parseInt(match[1], 10);
        const end = match[2] ? parseInt(match[2], 10) : start;
        if (!Number.isFinite(start) || start <= 0 || start > maxWeek) continue;
        if (!Number.isFinite(end) || end <= 0 || end > maxWeek) continue;
        const parity = normalizeWeekParityToken(match[3]);
        for (let i = start; i <= end; i++) {
          if (parity === "\u5355" && i % 2 === 0) continue;
          if (parity === "\u53CC" && i % 2 !== 0) continue;
          weekSet.add(i);
        }
      }
    }
    return Array.from(weekSet).sort((a, b) => a - b);
  };
  var formatWeekRanges = (weeks) => {
    if (!Array.isArray(weeks) || weeks.length === 0) return "";
    const uniqueWeeks = Array.from(new Set(weeks)).filter((n) => Number.isFinite(n)).sort((a, b) => a - b);
    if (uniqueWeeks.length === 0) return "";
    const ranges = [];
    let start = uniqueWeeks[0];
    let end = uniqueWeeks[0];
    for (let i = 1; i < uniqueWeeks.length; i++) {
      if (uniqueWeeks[i] === end + 1) {
        end = uniqueWeeks[i];
      } else {
        ranges.push(start === end ? `${start}` : `${start}-${end}`);
        start = uniqueWeeks[i];
        end = uniqueWeeks[i];
      }
    }
    ranges.push(start === end ? `${start}` : `${start}-${end}`);
    return `\u7B2C${ranges.join(",")}\u5468`;
  };
  var formatClassAndWeeksLines = (classNames, weeks) => {
    const names = Array.isArray(classNames) ? classNames : classNames ? [classNames] : [];
    const cleanNames = names.filter((n) => n).map((n) => String(n).replace(/^[\(（]/, "").replace(/[\)）]$/, "")).filter(Boolean);
    const dedup = [];
    for (const n of cleanNames) {
      if (!dedup.includes(n)) dedup.push(n);
    }
    const classText = dedup.length > 0 ? dedup.join("/") : "";
    const weeksText = formatWeekRanges(weeks);
    const lines = [];
    if (classText) lines.push(classText);
    if (weeksText) lines.push(weeksText);
    return { classText, weeksText, lines };
  };
  var icsEscapeText = (val) => {
    if (val == null) return "";
    return String(val).replace(/\\/g, "\\\\").replace(/\r\n|\r|\n/g, "\\n").replace(/;/g, "\\;").replace(/,/g, "\\,");
  };
  var icsFoldLine = (line, limitBytes) => {
    const limit = Number.isFinite(limitBytes) ? Number(limitBytes) : 75;
    const s = String(line == null ? "" : line);
    if (!s) return "";
    const enc = typeof TextEncoder !== "undefined" ? new TextEncoder() : null;
    const byteLen = (str) => {
      if (enc) return enc.encode(str).length;
      if (typeof Buffer !== "undefined") return Buffer.byteLength(str, "utf8");
      return unescape(encodeURIComponent(str)).length;
    };
    if (byteLen(s) <= limit) return s;
    let out = "";
    let cur = "";
    for (const ch of s) {
      const next = cur + ch;
      if (byteLen(next) > limit) {
        if (out) out += "\r\n ";
        out += cur;
        cur = ch;
      } else {
        cur = next;
      }
    }
    if (cur) {
      if (out) out += "\r\n ";
      out += cur;
    }
    return out;
  };
  var getPeriodBounds = (periodRange, fallbackPeriod, opts) => {
    const maxPeriod = opts && Number.isFinite(opts.maxPeriod) ? Number(opts.maxPeriod) : 20;
    const toP = (n) => {
      const v = parseInt(n, 10);
      if (!Number.isFinite(v)) return null;
      if (v <= 0) return null;
      if (v > maxPeriod) return null;
      return v;
    };
    const raw = periodRange == null ? "" : String(periodRange);
    const norm = sanitizePeriodRange(raw);
    const s = norm ? String(norm) : "";
    const nums = [];
    if (s) {
      const parts = s.split(",").map((x) => x.trim()).filter(Boolean);
      for (const part of parts) {
        const mRange = part.match(/^(\d+)\s*-\s*(\d+)$/);
        if (mRange) {
          const a = toP(mRange[1]);
          const b = toP(mRange[2]);
          if (a != null) nums.push(a);
          if (b != null) nums.push(b);
          continue;
        }
        const mSingle = part.match(/^(\d+)$/);
        if (mSingle) {
          const a = toP(mSingle[1]);
          if (a != null) nums.push(a);
        }
      }
    }
    if (nums.length === 0) {
      const fb = toP(fallbackPeriod);
      if (fb == null) return null;
      return { start: fb, end: fb };
    }
    let start = nums[0];
    let end = nums[0];
    for (const n of nums) {
      if (n < start) start = n;
      if (n > end) end = n;
    }
    if (!Number.isFinite(start) || !Number.isFinite(end)) return null;
    if (end < start) end = start;
    return { start, end };
  };
  var getTimeRangeForPeriod = (slots, periodRange, fallbackPeriod) => {
    if (!Array.isArray(slots) || slots.length === 0) return null;
    const bounds = getPeriodBounds(periodRange, fallbackPeriod, { maxPeriod: slots.length });
    if (!bounds) return null;
    const startSlot = slots[bounds.start - 1];
    const endSlot = slots[bounds.end - 1];
    if (!startSlot || !endSlot) return null;
    const startTime = startSlot.start;
    const endTime = endSlot.end;
    if (!isValidTime(startTime) || !isValidTime(endTime)) return null;
    return {
      startPeriod: bounds.start,
      endPeriod: bounds.end,
      startTime,
      endTime
    };
  };

  // packages/core/src/rules/normalizeRule.ts
  var normalizeRule_exports = {};
  __export(normalizeRule_exports, {
    generateId: () => generateId,
    normalizeCourseRuleInput: () => normalizeCourseRuleInput,
    parseWeeksForEditor: () => parseWeeksForEditor
  });
  var generateId = () => {
    if (typeof crypto !== "undefined" && crypto && typeof crypto.randomUUID === "function") {
      return crypto.randomUUID();
    }
    return `id_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
  };
  var parseNumList = (s, maxWeek) => {
    if (!s) return [];
    const set = /* @__PURE__ */ new Set();
    s.split(/[,，]/).forEach((part) => {
      const p = String(part || "").trim();
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
  var parseWeeksForEditor = (weeksRaw) => {
    const raw = String(weeksRaw || "").trim();
    if (!raw) return [];
    const maxWeek = 50;
    const parsed = parseWeekString(raw, { maxWeek });
    if (parsed && parsed.length > 0) {
      const hasComma = /[,，]/.test(raw);
      const weekMarkCount = (raw.match(/[周Ww]/g) || []).length;
      if (hasComma && weekMarkCount === 1) {
        const stripped2 = raw.replace(/^\s*第\s*/g, "").replace(/\s*周\s*$/g, "");
        if (stripped2 && stripped2 !== raw && /[,，]/.test(stripped2) && /^[\d\s,，\-]+$/.test(stripped2)) {
          const alt = parseNumList(stripped2, maxWeek);
          if (alt.length > parsed.length) return alt;
        }
      }
      return parsed;
    }
    const stripped = raw.replace(/^\s*第\s*/g, "").replace(/\s*周\s*$/g, "");
    if (stripped && stripped !== raw) {
      if (/^\s*\d+\s*(?:[,，]\s*\d+\s*)+$/.test(stripped)) {
        const nums = stripped.split(/[,，]/).map((x) => parseInt(String(x).trim(), 10)).filter((n) => Number.isFinite(n) && n > 0 && n <= maxWeek);
        return Array.from(new Set(nums)).sort((a, b) => a - b);
      }
      if (/[,，]/.test(stripped) && /^[\d\s,，\-]+$/.test(stripped)) {
        return parseNumList(stripped, maxWeek);
      }
    }
    if (/^\s*\d+\s*(?:[,，]\s*\d+\s*)+$/.test(raw)) {
      const nums = raw.split(/[,，]/).map((x) => parseInt(String(x).trim(), 10)).filter((n) => Number.isFinite(n) && n > 0 && n <= maxWeek);
      return Array.from(new Set(nums)).sort((a, b) => a - b);
    }
    if (/[,，]/.test(raw) && /^[\d\s,，\-]+$/.test(raw)) {
      return parseNumList(raw, maxWeek);
    }
    return [];
  };
  var normalizeCourseRuleInput = (input, currentSlots) => {
    const raw = input && typeof input === "object" ? input : {};
    const name = raw.name ? String(raw.name).trim() : "";
    if (!name) return { ok: false, message: "\u8BFE\u7A0B\u540D\u79F0\u4E0D\u80FD\u4E3A\u7A7A" };
    const dayOfWeek = parseInt(String(raw.dayOfWeek), 10);
    if (!Number.isFinite(dayOfWeek) || dayOfWeek < 1 || dayOfWeek > 7) return { ok: false, message: "\u661F\u671F\u4FE1\u606F\u65E0\u6548" };
    const periodSeed = raw.periodRange != null && String(raw.periodRange).trim() ? String(raw.periodRange) : raw.period != null ? String(raw.period) : "";
    const periodRange = sanitizePeriodRange(periodSeed);
    if (!periodRange) return { ok: false, message: "\u8282\u6B21\u4E0D\u80FD\u4E3A\u7A7A" };
    const weeksRawInput = raw.weeksRaw ? String(raw.weeksRaw).trim() : "";
    const weeksFromRaw = weeksRawInput ? parseWeeksForEditor(weeksRawInput) : [];
    const weeksFromArr = Array.isArray(raw.weeks) ? raw.weeks.map((n) => parseInt(String(n).trim(), 10)).filter((n) => Number.isFinite(n) && n > 0 && n <= 50) : [];
    const weeksArrDedup = Array.from(new Set(weeksFromArr)).sort((a, b) => a - b);
    const weeks = weeksArrDedup.length > 0 && weeksArrDedup.length > (weeksFromRaw ? weeksFromRaw.length : 0) ? weeksArrDedup : weeksFromRaw && weeksFromRaw.length > 0 ? weeksFromRaw : weeksArrDedup;
    if (!weeks || weeks.length === 0) return { ok: false, message: "\u5468\u6B21\u4E0D\u80FD\u4E3A\u7A7A\u6216\u683C\u5F0F\u4E0D\u6B63\u786E" };
    const weeksRaw = weeksRawInput || formatWeekRanges(weeks);
    const timeRange = getTimeRangeForPeriod(currentSlots, periodRange, null);
    if (!timeRange) return { ok: false, message: "\u8282\u6B21\u65F6\u95F4\u65E0\u6548\uFF0C\u8BF7\u68C0\u67E5\u8282\u6B21\u65F6\u95F4\u8BBE\u7F6E" };
    return {
      ok: true,
      rule: {
        id: raw.id ? String(raw.id) : generateId(),
        name,
        rawName: raw.rawName ? String(raw.rawName) : name,
        location: raw.location ? String(raw.location).trim() : "",
        className: raw.className ? String(raw.className).trim() : "",
        dayOfWeek,
        periodRange,
        weeksRaw,
        weeks,
        source: raw.source === "manual" ? "manual" : "auto",
        createdAt: Number.isFinite(Number(raw.createdAt)) ? Number(raw.createdAt) : raw.source === "manual" ? Date.now() : 0
      }
    };
  };

  // packages/core/src/rules/validateRules.ts
  var validateRules_exports = {};
  __export(validateRules_exports, {
    validateCourseRules: () => validateCourseRules
  });

  // packages/core/src/rules/standardizeLocation.ts
  var standardizeLocation_exports = {};
  __export(standardizeLocation_exports, {
    standardizeLocation: () => standardizeLocation
  });
  var standardizeLocation = (loc) => {
    if (!loc) return { location: "\u5F85\u901A\u77E5", building: "", room: "" };
    let s = loc;
    s = s.replace(/实验实训中心/g, "\u5B9E\u8BAD\u697C");
    s = s.replace(/(校区|场地|地点|场所)[：:]\s*/g, "");
    s = s.replace(/北苑电影大楼/g, "\u5317\u82D1\u7535\u5F71");
    s = s.replace(/学术中心/g, "\u5B66\u672F\u697C");
    s = s.replace(/南苑综合大楼/g, "\u5357\u82D1\u7EFC\u5408");
    s = s.replace(/第二教学楼/g, "\u4E8C\u6559");
    s = s.replace(/艺术大楼/g, "\u827A\u672F\u697C");
    s = s.replace(/传媒大楼/g, "\u4F20\u5A92\u697C");
    s = s.replace(/体育训练馆/g, "\u4F53\u80B2\u9986");
    s = s.replace(/创新创业大厦/g, "\u521B\u65B0\u697C");
    s = s.replace(/电子信息大楼/g, "\u7535\u5B50\u697C");
    const campusNoise = ["\u6842\u6797\u6D0B", "\u5E9C\u57CE", "\u9F99\u6606\u5357", "\u6821\u533A"];
    campusNoise.forEach((noise) => {
      s = s.replace(new RegExp(noise + "(\u6821\u533A)?", "g"), "");
    });
    s = s.replace(/校区[：:]?/g, "");
    s = s.replace(/\s+/g, "");
    s = s.replace(/一般(?=[A-Za-z]?\d)/g, "\u4E00\u6559");
    s = s.replace(/二般(?=[A-Za-z]?\d)/g, "\u4E8C\u6559");
    s = s.replace(/一(?:栋|棟)(?=[A-Za-z]?\d)/g, "\u4E00\u6559");
    s = s.replace(/二(?:栋|棟)(?=[A-Za-z]?\d)/g, "\u4E8C\u6559");
    const candidates = [];
    const pushCandidates = (re, kind, baseScore) => {
      let m;
      re.lastIndex = 0;
      while ((m = re.exec(s)) !== null) {
        const v = m[1];
        if (!v) continue;
        const idx = m.index;
        if (v.length > 10) continue;
        if (/^\d+$/.test(v) && v.length < 3) continue;
        let score = baseScore;
        if (/^[A-Za-z]/.test(v)) score += 3;
        if (/\d{3,4}$/.test(v)) score += 1;
        if (/\d{2}[\u4e00-\u9fa5]/.test(s.slice(idx + v.length, idx + v.length + 3))) score += 4;
        candidates.push({ idx, v, kind, score });
      }
    };
    pushCandidates(/([A-Za-z]{1,3}\d{2,4})(?=\d{2}[\u4e00-\u9fa5])/g, "alphaNum_yearMajor", 30);
    pushCandidates(/(\d{3,4})(?=\d{2}[\u4e00-\u9fa5])/g, "num_yearMajor", 24);
    pushCandidates(/([A-Za-z]{1,3}\d{2,4})(?!\d)/g, "alphaNum", 18);
    pushCandidates(/(\d{3,4})(?!\d)/g, "num", 14);
    pushCandidates(/(\d{1,4}[A-Za-z]{1,2})(?=\D|$)/g, "numAlpha", 12);
    let best = null;
    for (const c of candidates) {
      if (!best) {
        best = c;
        continue;
      }
      if (c.score > best.score) best = c;
      else if (c.score === best.score && c.idx < best.idx) best = c;
    }
    let building = "";
    let room = "";
    let truncatedSuffix = "";
    if (best) {
      room = best.v;
      const roomEndIdx = best.idx + room.length;
      building = s.substring(0, best.idx);
      truncatedSuffix = s.substring(roomEndIdx);
    } else {
      building = s;
    }
    const buildingRoom = building + room;
    let fullLocation = buildingRoom || "\u5F85\u901A\u77E5";
    if (building && room && building.endsWith(room)) {
      fullLocation = building;
    }
    return {
      location: fullLocation,
      building,
      room,
      _truncated: truncatedSuffix
    };
  };

  // packages/core/src/rules/validateRules.ts
  var validateCourseRules = (rules, currentSlots) => {
    const arr = Array.isArray(rules) ? rules : [];
    const bySlot = /* @__PURE__ */ new Map();
    for (const r of arr) {
      const norm = normalizeCourseRuleInput(r, currentSlots);
      if (!norm.ok || !norm.rule) return { ok: false, message: norm.message };
      const rule = norm.rule;
      const tr = getTimeRangeForPeriod(currentSlots, rule.periodRange, null);
      if (!tr) return { ok: false, message: `\u8BFE\u7A0B\u201C${rule.name}\u201D\u8282\u6B21\u65F6\u95F4\u65E0\u6548` };
      const sMin = parseTimeToMinutes(tr.startTime);
      const eMin = parseTimeToMinutes(tr.endTime);
      if (sMin == null || eMin == null || eMin <= sMin) return { ok: false, message: `\u8BFE\u7A0B\u201C${rule.name}\u201D\u65F6\u95F4\u65E0\u6548` };
      const loc = standardizeLocation(rule.location).location;
      for (const wk of rule.weeks) {
        const key = `${wk}-${rule.dayOfWeek}`;
        if (!bySlot.has(key)) bySlot.set(key, []);
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
          const parts = key.split("-");
          const wk = parts[0];
          const day = parseInt(parts[1], 10);
          const dayLabel = ["", "\u5468\u4E00", "\u5468\u4E8C", "\u5468\u4E09", "\u5468\u56DB", "\u5468\u4E94", "\u5468\u516D", "\u5468\u65E5"][day] || "";
          const sameTime = cur.startMin === prev.startMin && cur.endMin === prev.endMin;
          const sameLoc = String(cur.location || "") === String(prev.location || "");
          const samePeriod = cur.startPeriod === prev.startPeriod && cur.endPeriod === prev.endPeriod;
          if (sameTime && sameLoc && samePeriod) {
            warnings.push({ week: wk, day, dayLabel, a: prev.name, b: cur.name, location: cur.location });
            continue;
          }
          return { ok: false, message: `\u5B58\u5728\u65F6\u95F4\u51B2\u7A81\uFF1A\u7B2C${wk}\u5468${dayLabel}\u201C${prev.name}\u201D\u4E0E\u201C${cur.name}\u201D\u65F6\u95F4\u91CD\u53E0` };
        }
      }
    }
    return warnings.length > 0 ? { ok: true, warnings } : { ok: true };
  };

  // packages/core/src/events/generateEvents.ts
  var generateEvents_exports = {};
  __export(generateEvents_exports, {
    generateEvents: () => generateEvents
  });
  var generateEvents = (rules, semesterStart, currentSlots) => {
    if (!semesterStart || !(semesterStart instanceof Date) || !Number.isFinite(semesterStart.getTime())) {
      return [];
    }
    const out = [];
    const arr = Array.isArray(rules) ? rules : [];
    for (const r0 of arr) {
      const norm = normalizeCourseRuleInput(r0, currentSlots);
      if (!norm.ok || !norm.rule) continue;
      const r = norm.rule;
      const tr = getTimeRangeForPeriod(currentSlots, r.periodRange, null);
      if (!tr) continue;
      const periodNum = tr.startPeriod;
      let timeOfDay = "morning";
      if (periodNum >= 5 && periodNum <= 8) timeOfDay = "afternoon";
      if (periodNum >= 9) timeOfDay = "evening";
      for (const weekNum of r.weeks) {
        const daysToAdd = (weekNum - 1) * 7 + (r.dayOfWeek - 1);
        const targetDate = new Date(semesterStart);
        targetDate.setDate(semesterStart.getDate() + daysToAdd);
        out.push({
          title: r.name,
          rawTitle: r.rawName,
          location: r.location || "\u2014",
          className: r.className || "",
          weeks: r.weeks,
          periodRange: r.periodRange,
          startTime: tr.startTime,
          endTime: tr.endTime,
          date: targetDate,
          week: weekNum,
          period: periodNum,
          dayOfWeek: r.dayOfWeek,
          timeOfDay,
          description: `\u8BFE\u7A0B: ${r.rawName || r.name}
\u5730\u70B9: ${r.location || "\u2014"}
\u5468\u6B21: ${weekNum}\u5468
\u73ED\u7EA7: ${r.className || ""}`
        });
      }
    }
    out.sort((a, b) => {
      const ta = a.date.getTime();
      const tb = b.date.getTime();
      if (ta !== tb) return ta - tb;
      if ((a.period || 0) !== (b.period || 0)) return (a.period || 0) - (b.period || 0);
      return String(a.title || "").localeCompare(String(b.title || ""), "zh");
    });
    return out;
  };

  // packages/core/src/events/groupEventsForDisplay.ts
  var groupEventsForDisplay_exports = {};
  __export(groupEventsForDisplay_exports, {
    groupEventsForDisplay: () => groupEventsForDisplay
  });
  var groupEventsForDisplay = (events) => {
    const grouped = /* @__PURE__ */ new Map();
    events.forEach((ev) => {
      const key = `${ev.period}-${ev.location}-${ev.title}-${ev.className || ""}`;
      if (!grouped.has(key)) {
        grouped.set(key, {
          ...ev,
          classNames: ev.className ? [ev.className] : []
        });
      } else {
        const existing = grouped.get(key);
        if (ev.className && !existing.classNames.includes(ev.className)) {
          existing.classNames.push(ev.className);
        }
      }
    });
    return Array.from(grouped.values());
  };

  // apps/web/adapter.ts
  window.ScheduleLLMCore = {
    TimeUtils: timeUtils_exports,
    NormalizeRule: normalizeRule_exports,
    ValidateRules: validateRules_exports,
    GenerateEvents: generateEvents_exports,
    GroupEvents: groupEventsForDisplay_exports,
    StandardizeLocation: standardizeLocation_exports
  };
  window.ScheduleLLMTimeUtils = {
    ...timeUtils_exports
    // Add legacy aliases if any were missed or named differently
  };
})();
