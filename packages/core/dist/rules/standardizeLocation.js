"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.standardizeLocation = void 0;
const standardizeLocation = (loc) => {
    if (!loc)
        return { location: "待通知", building: "", room: "" };
    let s = loc;
    // 1. Basic Cleaning
    s = s.replace(/实验实训中心/g, "实训楼");
    s = s.replace(/(校区|场地|地点|场所)[：:]\s*/g, "");
    s = s.replace(/北苑电影大楼/g, "北苑电影");
    s = s.replace(/学术中心/g, "学术楼");
    s = s.replace(/南苑综合大楼/g, "南苑综合");
    s = s.replace(/第二教学楼/g, "二教");
    s = s.replace(/艺术大楼/g, "艺术楼");
    s = s.replace(/传媒大楼/g, "传媒楼");
    s = s.replace(/体育训练馆/g, "体育馆");
    s = s.replace(/创新创业大厦/g, "创新楼");
    s = s.replace(/电子信息大楼/g, "电子楼");
    // 2. Remove Campus Noise
    const campusNoise = ["桂林洋", "府城", "龙昆南", "校区"];
    campusNoise.forEach(noise => {
        s = s.replace(new RegExp(noise + "(校区)?", 'g'), "");
    });
    s = s.replace(/校区[：:]?/g, "");
    // 3. Remove ALL whitespace to ensure clean parsing
    s = s.replace(/\s+/g, "");
    s = s.replace(/一般(?=[A-Za-z]?\d)/g, "一教");
    s = s.replace(/二般(?=[A-Za-z]?\d)/g, "二教");
    s = s.replace(/一(?:栋|棟)(?=[A-Za-z]?\d)/g, "一教");
    s = s.replace(/二(?:栋|棟)(?=[A-Za-z]?\d)/g, "二教");
    const candidates = [];
    const pushCandidates = (re, kind, baseScore) => {
        let m;
        re.lastIndex = 0;
        while ((m = re.exec(s)) !== null) {
            const v = m[1];
            if (!v)
                continue;
            const idx = m.index;
            if (v.length > 10)
                continue;
            if (/^\d+$/.test(v) && v.length < 3)
                continue;
            let score = baseScore;
            if (/^[A-Za-z]/.test(v))
                score += 3;
            if (/\d{3,4}$/.test(v))
                score += 1;
            if (/\d{2}[\u4e00-\u9fa5]/.test(s.slice(idx + v.length, idx + v.length + 3)))
                score += 4;
            candidates.push({ idx, v, kind, score });
        }
    };
    pushCandidates(/([A-Za-z]{1,3}\d{2,4})(?=\d{2}[\u4e00-\u9fa5])/g, 'alphaNum_yearMajor', 30);
    pushCandidates(/(\d{3,4})(?=\d{2}[\u4e00-\u9fa5])/g, 'num_yearMajor', 24);
    pushCandidates(/([A-Za-z]{1,3}\d{2,4})(?!\d)/g, 'alphaNum', 18);
    pushCandidates(/(\d{3,4})(?!\d)/g, 'num', 14);
    pushCandidates(/(\d{1,4}[A-Za-z]{1,2})(?=\D|$)/g, 'numAlpha', 12);
    let best = null;
    for (const c of candidates) {
        if (!best) {
            best = c;
            continue;
        }
        if (c.score > best.score)
            best = c;
        else if (c.score === best.score && c.idx < best.idx)
            best = c;
    }
    let building = "";
    let room = "";
    let truncatedSuffix = "";
    if (best) {
        room = best.v;
        const roomEndIdx = best.idx + room.length;
        building = s.substring(0, best.idx);
        truncatedSuffix = s.substring(roomEndIdx);
        // Logging omitted in core
    }
    else {
        building = s;
    }
    const buildingRoom = building + room;
    let fullLocation = buildingRoom || "待通知";
    if (building && room && building.endsWith(room)) {
        // Logging omitted in core
        fullLocation = building;
    }
    return {
        location: fullLocation,
        building: building,
        room: room,
        _truncated: truncatedSuffix
    };
};
exports.standardizeLocation = standardizeLocation;
