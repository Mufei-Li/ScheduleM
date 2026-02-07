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
exports.generateHTML = void 0;
const TimeUtils = __importStar(require("../time/timeUtils"));
const CSS_STYLES = `
    :root {
        --primary: #3b82f6;
        --bg: #f1f5f9;
        --card-bg: #ffffff;
        --text-main: #1e293b;
        --text-muted: #64748b;
        --border: #e2e8f0;
        --morning: #10b981;
        --afternoon: #f59e0b;
        --evening: #6366f1;
        --radius: 12px;
        --shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }

    body { 
        background: var(--bg); 
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; 
        color: var(--text-main);
        line-height: 1.5;
        padding: 40px 20px;
        overflow-y: auto;
        height: auto;
    }

    .export-header {
        max-width: 1200px;
        margin: 0 auto 40px auto;
        text-align: center;
    }

    .export-title {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 12px;
        font-size: 2.5rem;
        font-weight: 800;
        color: var(--primary);
        margin-bottom: 8px;
        letter-spacing: -0.025em;
    }

    .export-logo {
        height: 1em;
        width: auto;
        flex: 0 0 auto;
    }

    .export-header p {
        color: var(--text-muted);
        font-size: 1.1rem;
    }

    .export-site-link {
        color: inherit;
        text-decoration: none;
        border-bottom: 1px solid currentColor;
    }

    .export-site-link:hover {
        opacity: 0.9;
    }

    .content-wrapper {
        max-width: 1200px;
        margin: 0 auto;
    }

    .month-container { 
        background: var(--card-bg);
        border-radius: var(--radius);
        box-shadow: var(--shadow);
        padding: 24px;
        margin-bottom: 40px; 
        border: 1px solid var(--border);
    }

    .month-title { 
        font-size: 1.5rem;
        font-weight: 700;
        color: var(--text-main);
        margin-bottom: 20px;
        text-align: left;
        padding-left: 8px;
        border-left: 4px solid var(--primary);
    }

    .calendar-grid { 
        display: grid; 
        grid-template-columns: repeat(7, 1fr); 
        gap: 12px; 
    }

    .calendar-header-cell { 
        text-align: center; 
        color: var(--text-muted);
        font-size: 0.875rem;
        font-weight: 600;
        padding: 8px;
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }

    .calendar-day { 
        background: #f8fafc;
        border: 1px solid var(--border);
        border-radius: 8px;
        min-height: 120px; 
        padding: 8px; 
        display: flex;
        flex-direction: column;
        gap: 6px;
        transition: transform 0.2s, box-shadow 0.2s;
    }

    .calendar-day:hover {
        transform: translateY(-2px);
        box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
        background: #fff;
    }

    .calendar-day.empty { 
        background: transparent;
        border: 1px dashed var(--border);
    }

    .day-number { 
        font-size: 0.875rem; 
        font-weight: 700;
        display: flex; 
        justify-content: space-between; 
        align-items: center;
        margin-bottom: 4px;
        color: var(--text-muted);
    }

    .week-badge {
        font-size: 0.7rem;
        background: #eff6ff;
        color: var(--primary);
        padding: 2px 6px;
        border-radius: 4px;
        font-weight: 600;
    }

    .event-item { 
        padding: 6px 8px; 
        border-radius: 6px;
        font-size: 0.75rem; 
        font-weight: 500;
        line-height: 1.3;
        border-left: 3px solid transparent;
    }

    .type-morning { 
        background: #ecfdf5; 
        color: #065f46;
        border-left-color: var(--morning); 
    }

    .type-afternoon { 
        background: #fffbeb; 
        color: #92400e;
        border-left-color: var(--afternoon); 
    }

    .type-evening { 
        background: #f5f3ff; 
        color: #3730a3;
        border-left-color: var(--evening); 
    }

    .ev-time { 
        font-weight: 700; 
        display: block;
        font-size: 0.7rem;
        opacity: 0.8;
        margin-bottom: 2px;
    }

    .ev-location { 
        display: block;
        font-size: 0.7rem;
        font-style: italic;
        margin-top: 2px;
        opacity: 0.8;
        margin-bottom: 2px;
    }

    .ev-title {
        word-break: break-word;
    }
    
    .ev-header {
        font-size: 12px;
        font-weight: 400;
        color: var(--text-muted);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        display: flex;
        align-items: center;
        gap: 2px;
    }

    .ev-period {
        font-size: 11px;
        font-family: "Inter", "Microsoft YaHei", sans-serif;
        color: #2B579A;
        background-color: #dbeafe;
        padding: 1px 5px;
        border-radius: 4px;
        font-weight: 600;
        letter-spacing: 0.5px;
    }

    .ev-location-separator {
            color: #cbd5e1;
            font-size: 11px;
            margin: 0 2px;
    }

    .ev-location {
        font-size: 13px;
        font-family: "Inter", "Microsoft YaHei", sans-serif;
        color: #333333;
        font-weight: 500;
    }

    .ev-course-name {
        font-size: 14px;
        font-weight: 700;
        color: var(--text-main);
        margin-top: 2px;
        position: relative;
        cursor: pointer;
        line-height: 1.4;
    }

    .ev-tooltip {
        visibility: hidden;
        opacity: 0;
        position: absolute;
        background: #333;
        color: white;
        padding: 8px 12px;
        border-radius: 6px;
        font-size: 11px;
        font-weight: 400;
        width: max-content;
        max-width: 200px;
        top: 100%;
        left: 0;
        z-index: 1000;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        transition: opacity 0.2s ease-in-out, visibility 0.2s ease-in-out;
        transition-delay: 0.2s;
        pointer-events: none;
    }

    .ev-course-name:hover .ev-tooltip {
        visibility: visible;
        opacity: 1;
        transition-delay: 0.4s;
    }

    @media (hover: none) {
        .ev-course-name:active .ev-tooltip {
            visibility: visible;
            opacity: 1;
            transition-delay: 0s;
        }
    }

    @media print {
        body { background: white; padding: 0; }
        .month-container { box-shadow: none; border-color: #eee; page-break-inside: avoid; }
    }
`;
const escapeHtml = (unsafe) => {
    if (!unsafe)
        return '';
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
};
const renderEventItem = (ev, options) => {
    const pRange = ev.periodRange ? ev.periodRange : ev.period;
    const tooltipInfo = TimeUtils.formatClassAndWeeksLines(ev.classNames, ev.weeks);
    const tooltipClassText = tooltipInfo.classText;
    const weeksText = tooltipInfo.weeksText;
    return `
        <div class="event-item type-${ev.timeOfDay}">
            <div class="ev-header">
                <span class="ev-period">第${escapeHtml(String(pRange))}节</span>
                <span class="ev-location-separator">@</span>
                <span class="ev-location">${escapeHtml(ev.location)}</span>
            </div>
            <div class="ev-course-name">
                ${escapeHtml(ev.title)}
                <div class="ev-tooltip">
                    ${tooltipClassText ? `<div>${escapeHtml(tooltipClassText)}</div>` : ''}
                    <div>${escapeHtml(weeksText)}</div>
                </div>
            </div>
        </div>
    `;
};
const renderMonth = (date, events, options) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    // Header
    const daysHeader = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
        .map(d => `<div class="calendar-header-cell">${d}</div>`)
        .join('');
    // First day alignment
    const firstDayOfMonth = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    let startDayOfWeek = firstDayOfMonth.getDay();
    if (startDayOfWeek === 0)
        startDayOfWeek = 7;
    let gridHtml = '';
    // Empty slots
    for (let i = 1; i < startDayOfWeek; i++) {
        gridHtml += `<div class="calendar-day empty"></div>`;
    }
    // Days
    for (let d = 1; d <= daysInMonth; d++) {
        const currentDayDate = new Date(year, month, d);
        // Find events
        const dayEvents = events.filter(e => e.date.getFullYear() === year &&
            e.date.getMonth() === month &&
            e.date.getDate() === d);
        dayEvents.sort((a, b) => a.period - b.period);
        // Group events
        const groupedEvents = new Map();
        dayEvents.forEach(ev => {
            const key = `${ev.period}-${ev.location}-${ev.title}-${ev.className || ''}`;
            if (!groupedEvents.has(key)) {
                groupedEvents.set(key, { ...ev, classNames: [ev.className] });
            }
            else {
                const existing = groupedEvents.get(key);
                if (ev.className && !existing.classNames.includes(ev.className)) {
                    existing.classNames.push(ev.className);
                }
            }
        });
        const displayEvents = Array.from(groupedEvents.values());
        // Day Number + Week Badge
        let dayOfWeek = currentDayDate.getDay();
        if (dayOfWeek === 0)
            dayOfWeek = 7;
        let badgeHtml = '';
        if (dayOfWeek === 1 || d === 1) {
            let weekNum = null;
            if (dayEvents.length > 0 && Number.isFinite(dayEvents[0].week)) {
                weekNum = dayEvents[0].week;
            }
            else {
                // Fallback week calculation if needed, or skip
                // Ideally events have week number. If not, we might need a reference start date.
                // For simple export, we rely on event data.
            }
            if (Number.isFinite(weekNum) && weekNum > 0) {
                badgeHtml = `<span class="week-badge">第${weekNum}周</span>`;
            }
        }
        const eventsHtml = displayEvents.map(ev => renderEventItem(ev, options)).join('');
        gridHtml += `
            <div class="calendar-day">
                <div class="day-number">
                    <span>${d}</span>
                    ${badgeHtml}
                </div>
                <div class="day-events">
                    ${eventsHtml}
                </div>
            </div>
        `;
    }
    return `
        <div class="month-container">
            <div class="month-title">${year}年 ${month + 1}月</div>
            <div class="calendar-grid">
                ${daysHeader}
                ${gridHtml}
            </div>
        </div>
    `;
};
const generateHTML = (events, options) => {
    if (!events || events.length === 0)
        return '';
    let minTime = Infinity;
    let maxTime = -Infinity;
    events.forEach(e => {
        const t = e.date.getTime();
        if (t < minTime)
            minTime = t;
        if (t > maxTime)
            maxTime = t;
    });
    const startDate = new Date(minTime);
    const endDate = new Date(maxTime);
    const startYear = startDate.getFullYear();
    const startMonth = startDate.getMonth();
    const endYear = endDate.getFullYear();
    const endMonth = endDate.getMonth();
    let contentHtml = '';
    let iterDate = new Date(startYear, startMonth, 1);
    while (iterDate.getFullYear() < endYear || (iterDate.getFullYear() === endYear && iterDate.getMonth() <= endMonth)) {
        contentHtml += renderMonth(new Date(iterDate), events, options);
        iterDate.setMonth(iterDate.getMonth() + 1);
    }
    const logoSrc = options.logoDataUrl || 'Logo_yedaoai_Green_Web600.png';
    return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>我的课表 - ScheduleLLM</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet">
    <style>
        ${CSS_STYLES}
    </style>
</head>
<body>
    <header class="export-header">
        <h1 class="export-title"><img class="export-logo" src="${logoSrc}" alt="YedaoAI" loading="eager" decoding="async" onerror="this.style.display='none';">课程表月历</h1>
        <p>由析课识别生成 · <a class="export-site-link" href="https://yedaoai.com" target="_blank" rel="noopener noreferrer">yedaoai.com</a></p>
    </header>
    <div class="content-wrapper">
        ${contentHtml}
    </div>
</body>
</html>
    `;
};
exports.generateHTML = generateHTML;
