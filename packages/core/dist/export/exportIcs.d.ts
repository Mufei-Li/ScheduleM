import { CalendarEvent, TimeSlot } from '../types';
export type ICSTarget = 'universal' | 'ios' | 'android' | 'windows' | 'vcard';
export interface ICSOptions {
    target: ICSTarget;
    alarmEnabled?: boolean;
    alarmMinutes?: number;
    timeSlots: TimeSlot[];
}
export interface ExportResult {
    content: string;
    filename: string;
    mimeType: string;
}
export declare const generateICS: (events: CalendarEvent[], options: ICSOptions) => ExportResult;
