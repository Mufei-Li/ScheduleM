import { CalendarEvent } from '../types';
export interface DisplayEvent extends CalendarEvent {
    classNames: string[];
}
export declare const groupEventsForDisplay: (events: CalendarEvent[]) => DisplayEvent[];
