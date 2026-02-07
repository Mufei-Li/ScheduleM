"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateICS = void 0;
const TimeUtils = __importStar(require("../time/timeUtils"));
const dayStrForExport = (d) => {
    return String(d.toISOString().split('T')[0]).replace(/-/g, '');
};
const buildExportDescription = (ev, classNamesMap) => {
    const dayStr = dayStrForExport(ev.date);
    const key = `${dayStr}-${ev.period}-${ev.location}-${ev.title}`;
    const classNames = classNamesMap.get(key) || (ev.className ? [ev.className] : []);
    const info = TimeUtils.formatClassAndWeeksLines(classNames, ev.weeks);
    return (info && Array.isArray(info.lines)) ? info.lines.join('\n') : '';
};
const getExportTimeRangeForEvent = (ev, timeSlots) => {
    const periodRange = ev && ev.periodRange ? ev.periodRange : '';
    const fallbackPeriod = ev && Number.isFinite(ev.period) ? ev.period : null;
    const tr = TimeUtils.getTimeRangeForPeriod(timeSlots, periodRange, fallbackPeriod);
    if (!tr) {
        const startTime = ev && ev.startTime ? ev.startTime : '';
        const endTime = ev && ev.endTime ? ev.endTime : '';
        return { startTime, endTime, source: 'event' };
    }
    return { startTime: tr.startTime, endTime: tr.endTime, source: 'settings' };
};
const generateICS = (events, options) => {
    if (!events || events.length === 0) {
        throw new Error('No events to export');
    }
    const { target, alarmEnabled = true, alarmMinutes = 15, timeSlots } = options;
    let prodId = "-//ScheduleLLM//CN";
    if (target === 'windows')
        prodId = "-//Microsoft Corporation//Outlook 16.0 MIMEDIR//EN";
    if (target === 'ios')
        prodId = "-//Apple Inc.//iOS 15.0//EN";
    // Pre-calculate class names map for grouping
    const classNamesMap = new Map();
    events.forEach(ev => {
        const dayStr = dayStrForExport(ev.date);
        const key = `${dayStr}-${ev.period}-${ev.location}-${ev.title}`;
        if (!classNamesMap.has(key))
            classNamesMap.set(key, []);
        const arr = classNamesMap.get(key);
        if (ev.className && arr && !arr.includes(ev.className))
            arr.push(ev.className);
    });
    if (target === 'vcard') {
        let vcsContent = `BEGIN:VCALENDAR\r\nVERSION:1.0\r\nPRODID:-//ScheduleLLM//CN\r\nTZ:-08\r\n`;
        events.forEach(ev => {
            const dayStr = dayStrForExport(ev.date);
            const tr = getExportTimeRangeForEvent(ev, timeSlots);
            const startStr = `${dayStr}T${String(tr.startTime || '').replace(/:/g, '')}00`;
            const endStr = `${dayStr}T${String(tr.endTime || '').replace(/:/g, '')}00`;
            const description = buildExportDescription(ev, classNamesMap);
            vcsContent += "BEGIN:VEVENT\r\n";
            vcsContent += TimeUtils.icsFoldLine(`SUMMARY:${TimeUtils.icsEscapeText(ev.title)}`) + "\r\n";
            vcsContent += `DTSTART:${startStr}\r\n`;
            vcsContent += `DTEND:${endStr}\r\n`;
            vcsContent += TimeUtils.icsFoldLine(`LOCATION:${TimeUtils.icsEscapeText(ev.location)}`) + "\r\n";
            vcsContent += TimeUtils.icsFoldLine(`DESCRIPTION:${TimeUtils.icsEscapeText(description)}`) + "\r\n";
            vcsContent += "END:VEVENT\r\n";
        });
        vcsContent += "END:VCALENDAR";
        return {
            content: vcsContent,
            filename: 'schedule_export.vcs',
            mimeType: 'text/x-vcalendar;charset=utf-8'
        };
    }
    let icsContent = `BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:${prodId}\r\nCALSCALE:GREGORIAN\r\nMETHOD:PUBLISH\r\n`;
    events.forEach(ev => {
        const dayStr = dayStrForExport(ev.date);
        const tr = getExportTimeRangeForEvent(ev, timeSlots);
        const startStr = `${dayStr}T${String(tr.startTime || '').replace(/:/g, '')}00`;
        const endStr = `${dayStr}T${String(tr.endTime || '').replace(/:/g, '')}00`;
        let description = ev.description || '';
        icsContent += "BEGIN:VEVENT\r\n";
        icsContent += `UID:${Date.now()}-${Math.random()}@schedulellm\r\n`;
        icsContent += `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z\r\n`;
        icsContent += `DTSTART;TZID=Asia/Shanghai:${startStr}\r\n`;
        icsContent += `DTEND;TZID=Asia/Shanghai:${endStr}\r\n`;
        const descText = buildExportDescription(ev, classNamesMap);
        icsContent += TimeUtils.icsFoldLine(`SUMMARY:${TimeUtils.icsEscapeText(ev.title)}`) + "\r\n";
        icsContent += TimeUtils.icsFoldLine(`LOCATION:${TimeUtils.icsEscapeText(ev.location)}`) + "\r\n";
        icsContent += TimeUtils.icsFoldLine(`DESCRIPTION:${TimeUtils.icsEscapeText(descText)}`) + "\r\n";
        if ((target === 'ios' || target === 'android') && alarmEnabled && alarmMinutes > 0) {
            icsContent += `BEGIN:VALARM\r\nTRIGGER:-PT${alarmMinutes}M\r\nACTION:DISPLAY\r\nDESCRIPTION:Reminder\r\nEND:VALARM\r\n`;
        }
        if (target === 'windows') {
            icsContent += `X-MICROSOFT-CDO-BUSYSTATUS:BUSY\r\n`;
        }
        icsContent += "END:VEVENT\r\n";
    });
    icsContent += "END:VCALENDAR";
    return {
        content: icsContent,
        filename: `schedule_${target}.ics`,
        mimeType: 'text/calendar;charset=utf-8'
    };
};
exports.generateICS = generateICS;
