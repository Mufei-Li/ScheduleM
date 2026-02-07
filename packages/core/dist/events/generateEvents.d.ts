import { CourseRule, CalendarEvent, TimeSlot } from '../types';
export declare const generateEvents: (rules: Partial<CourseRule>[], semesterStart: Date, currentSlots: TimeSlot[]) => CalendarEvent[];
