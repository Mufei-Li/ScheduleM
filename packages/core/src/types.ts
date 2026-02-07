export type Grid = string[][];

export interface TimeSlot {
    start: string; // "HH:mm"
    end: string;   // "HH:mm"
}

export interface CourseRule {
    id: string;
    name: string;
    rawName: string;
    location: string;
    className: string;
    dayOfWeek: number; // 1-7
    periodRange: string; // "1-2"
    weeksRaw: string; // "1-16周"
    weeks: number[]; // [1, 2, ..., 16]
    source: 'auto' | 'manual';
    createdAt: number; // timestamp
}

export interface CalendarEvent {
    title: string;
    rawTitle: string;
    location: string;
    className: string;
    weeks: number[];
    periodRange: string;
    startTime: string; // "HH:mm"
    endTime: string;   // "HH:mm"
    date: Date;
    week: number;
    period: number; // start period number
    dayOfWeek: number;
    timeOfDay: 'morning' | 'afternoon' | 'evening';
    description: string;
    
    // UI grouping helper (optional, might not belong to core type but useful)
    // classNames?: string[]; 
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
