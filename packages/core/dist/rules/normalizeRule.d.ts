import { CourseRule, TimeSlot } from '../types';
export declare const generateId: () => string;
export declare const parseWeeksForEditor: (weeksRaw: string) => number[];
export interface NormalizeResult {
    ok: boolean;
    message?: string;
    rule?: CourseRule;
}
export declare const normalizeCourseRuleInput: (input: Partial<CourseRule>, currentSlots: TimeSlot[]) => NormalizeResult;
