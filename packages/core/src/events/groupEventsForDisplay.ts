import { CalendarEvent } from '../types';

export interface DisplayEvent extends CalendarEvent {
    classNames: string[];
}

export const groupEventsForDisplay = (events: CalendarEvent[]): DisplayEvent[] => {
    const grouped = new Map<string, DisplayEvent>();

    events.forEach(ev => {
        // Key logic aligned with script.js: period + location + title + className
        // This ensures same-time same-location same-course BUT different class are kept SEPARATE in map key
        // Wait, script.js key includes className: 
        // const key = `${ev.period}-${ev.location}-${ev.title}-${ev.className || ''}`;
        // This means they are NOT merged if className differs.
        // But then logic says:
        // if (!groupedEvents.has(key)) { ... classNames: [ev.className] } 
        // else { ... existing.classNames.push(ev.className) }
        // If key includes className, then `existing` will only be found if className matches exactly.
        // So `classNames` array will always have 1 item (duplicates removed).
        // 
        // IF the intent of script.js code was to merge different classes for same course/time/loc,
        // then key should NOT include className. 
        //
        // LET'S CHECK script.js logic again carefully:
        // 4337: const key = `${ev.period}-${ev.location}-${ev.title}-${ev.className || ''}`;
        // 
        // Result: Same course, same time, same loc, DIFFERENT class -> Different Key -> Not merged.
        // This confirms "同日同节次同地点不同班级不合并".
        //
        // So we strictly follow script.js logic here.

        const key = `${ev.period}-${ev.location}-${ev.title}-${ev.className || ''}`;
        
        if (!grouped.has(key)) {
            grouped.set(key, {
                ...ev,
                classNames: ev.className ? [ev.className] : []
            });
        } else {
            const existing = grouped.get(key)!;
            if (ev.className && !existing.classNames.includes(ev.className)) {
                existing.classNames.push(ev.className);
            }
        }
    });

    return Array.from(grouped.values());
};
