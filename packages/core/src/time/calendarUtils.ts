export interface CalendarDay {
    year: number;
    month: number; // 0-11
    day: number;
    isCurrentMonth: boolean;
    weekNumber?: number;
    dateStr: string; // YYYY-MM-DD
}

export interface CalendarGrid {
    year: number;
    month: number;
    weeks: CalendarDay[][];
}

/**
 * Get calendar grid for a given month (Monday start)
 */
export const getCalendarGrid = (year: number, month: number): CalendarGrid => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();

    // 0=Sun, 1=Mon ... 6=Sat
    let startDayOfWeek = firstDay.getDay();
    // Adjust to Monday start: Mon=0, ..., Sun=6
    startDayOfWeek = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;

    const weeks: CalendarDay[][] = [];
    let currentWeek: CalendarDay[] = [];

    // Previous month padding
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = 0; i < startDayOfWeek; i++) {
        const d = prevMonthLastDay - startDayOfWeek + i + 1;
        // Previous month could be last year
        const pmDate = new Date(year, month - 1, d);
        currentWeek.push({
            year: pmDate.getFullYear(),
            month: pmDate.getMonth(),
            day: d,
            isCurrentMonth: false,
            dateStr: pmDate.toISOString().split('T')[0]
        });
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
        const dateStr = new Date(year, month, d).toISOString().split('T')[0]; // Simple ISO date
        // Note: ISO string uses UTC. We should be careful with timezones.
        // Better construct manually to avoid timezone issues with ISOString near boundaries.
        const y = year;
        const m = month + 1;
        const dateStrManual = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        
        currentWeek.push({
            year,
            month,
            day: d,
            isCurrentMonth: true,
            dateStr: dateStrManual
        });

        if (currentWeek.length === 7) {
            weeks.push(currentWeek);
            currentWeek = [];
        }
    }

    // Next month padding
    if (currentWeek.length > 0) {
        let d = 1;
        while (currentWeek.length < 7) {
            const nmDate = new Date(year, month + 1, d);
            currentWeek.push({
                year: nmDate.getFullYear(),
                month: nmDate.getMonth(),
                day: d,
                isCurrentMonth: false,
                dateStr: `${nmDate.getFullYear()}-${String(nmDate.getMonth() + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
            });
            d++;
        }
        weeks.push(currentWeek);
    }

    // Add extra rows if needed to always show 6 rows (optional, keeps UI stable)
    // Most calendars show 6 rows to cover all possibilities (e.g. 1st is Sunday on a 31-day month)
    // If we want dynamic height, we can stop here. Let's keep it dynamic for now.

    return {
        year,
        month,
        weeks
    };
};
