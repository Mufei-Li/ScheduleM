export interface CalendarDay {
    year: number;
    month: number;
    day: number;
    isCurrentMonth: boolean;
    weekNumber?: number;
    dateStr: string;
}
export interface CalendarGrid {
    year: number;
    month: number;
    weeks: CalendarDay[][];
}
/**
 * Get calendar grid for a given month (Monday start)
 */
export declare const getCalendarGrid: (year: number, month: number) => CalendarGrid;
