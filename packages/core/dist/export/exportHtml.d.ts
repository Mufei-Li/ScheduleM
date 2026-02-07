import { CalendarEvent, TimeSlot } from '../types';
export interface HTMLOptions {
    timeSlots: TimeSlot[];
    logoDataUrl?: string;
    printMode?: boolean;
}
export declare const generateHTML: (events: CalendarEvent[], options: HTMLOptions) => string;
