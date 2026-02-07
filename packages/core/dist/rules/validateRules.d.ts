import { CourseRule, TimeSlot } from '../types';
export interface ValidationWarning {
    week: string;
    day: number;
    dayLabel: string;
    a: string;
    b: string;
    location: string;
}
export interface ValidationResult {
    ok: boolean;
    message?: string;
    warnings?: ValidationWarning[];
}
export declare const validateCourseRules: (rules: Partial<CourseRule>[], currentSlots: TimeSlot[]) => ValidationResult;
