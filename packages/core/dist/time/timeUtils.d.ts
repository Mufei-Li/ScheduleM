import { TimeSlot } from '../types';
export * from './calendarUtils';
export declare const isValidTime: (t: any) => boolean;
export declare const parseTimeToMinutes: (t: string) => number | null;
export declare const formatMinutes: (m: number) => string | null;
export declare const addMinutesToTime: (t: string, delta: number) => string | null;
export declare const diffTimeMinutes: (from: string, to: string) => number | null;
export declare const shiftSlots: (slots: TimeSlot[], indices: number[], delta: number) => {
    ok: boolean;
    message?: string;
    slots?: TimeSlot[];
};
export declare const validateSlots: (slots: TimeSlot[]) => {
    ok: boolean;
    message?: string;
};
interface ShiftOpts {
    firstDuration?: number;
    maxIndex?: number;
}
export declare const computeShiftedSlots: (baseSlots: TimeSlot[], idx: number, type: "start" | "end", newValue: string, opts?: ShiftOpts) => {
    ok: boolean;
    message?: string;
    slots?: TimeSlot[];
};
export declare const sanitizePeriodRange: (periodRange: any) => string;
export declare const normalizeWeekParityToken: (raw: any) => string | null;
export declare const parseWeekString: (str: any, opts?: {
    maxWeek?: number;
}) => number[];
export declare const formatWeekRanges: (weeks: number[]) => string;
export declare const formatClassAndWeeksLines: (classNames: any, weeks: number[]) => {
    classText: string;
    weeksText: string;
    lines: string[];
};
export declare const icsEscapeText: (val: any) => string;
export declare const icsFoldLine: (line: any, limitBytes?: number) => string;
export declare const getPeriodBounds: (periodRange: any, fallbackPeriod: any, opts?: {
    maxPeriod?: number;
}) => {
    start: number;
    end: number;
} | null;
export declare const getTimeRangeForPeriod: (slots: TimeSlot[], periodRange: any, fallbackPeriod: any) => {
    startPeriod: number;
    endPeriod: number;
    startTime: string;
    endTime: string;
} | null;
