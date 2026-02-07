export type Grid = string[][];
export interface TimeSlot {
    start: string;
    end: string;
}
export interface CourseRule {
    id: string;
    name: string;
    rawName: string;
    location: string;
    className: string;
    dayOfWeek: number;
    periodRange: string;
    weeksRaw: string;
    weeks: number[];
    source: 'auto' | 'manual';
    createdAt: number;
}
export interface CalendarEvent {
    title: string;
    rawTitle: string;
    location: string;
    className: string;
    weeks: number[];
    periodRange: string;
    startTime: string;
    endTime: string;
    date: Date;
    week: number;
    period: number;
    dayOfWeek: number;
    timeOfDay: 'morning' | 'afternoon' | 'evening';
    description: string;
}
export interface ProgressState {
    visible: boolean;
    running: boolean;
    stage: 'idle' | 'preparing' | 'processing' | 'slow' | 'error' | 'done';
    processed: number;
    total: number;
    extracted: number;
    text: string;
    error?: string;
    icon?: 'warn' | 'err' | 'done' | null;
}
