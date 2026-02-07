import AsyncStorage from '@react-native-async-storage/async-storage';
import { CourseRule, TimeSlot, CalendarEvent, GenerateEvents, TimeUtils } from '@schedulem/core';

const STORAGE_KEYS = {
    COURSE_RULES: 'schedule_course_rules',
    TIME_SLOTS: 'schedule_time_slots',
    SEMESTER_START: 'schedule_semester_start',
};

export class CourseStore {
    // Singleton
    private static instance: CourseStore;
    private constructor() {}
    public static getInstance(): CourseStore {
        if (!CourseStore.instance) {
            CourseStore.instance = new CourseStore();
        }
        return CourseStore.instance;
    }

    // State
    private rules: CourseRule[] = [];
    private timeSlots: TimeSlot[] = [
        { start: '08:00', end: '08:45' },
        { start: '08:55', end: '09:40' },
        { start: '10:00', end: '10:45' },
        { start: '10:55', end: '11:40' },
        { start: '14:30', end: '15:15' },
        { start: '15:25', end: '16:10' },
        { start: '16:30', end: '17:15' },
        { start: '17:25', end: '18:10' },
        { start: '19:30', end: '20:15' },
        { start: '20:25', end: '21:10' },
        { start: '21:20', end: '22:05' },
        { start: '22:15', end: '23:00' }
    ];
    private semesterStartDate: string = '2024-09-02'; // Default

    // Initialization
    public async init() {
        try {
            const [rulesStr, slotsStr, startStr] = await AsyncStorage.multiGet([
                STORAGE_KEYS.COURSE_RULES,
                STORAGE_KEYS.TIME_SLOTS,
                STORAGE_KEYS.SEMESTER_START
            ]);

            if (rulesStr[1]) this.rules = JSON.parse(rulesStr[1]);
            if (slotsStr[1]) this.timeSlots = JSON.parse(slotsStr[1]);
            if (startStr[1]) this.semesterStartDate = startStr[1];
        } catch (e) {
            console.error('Failed to load storage', e);
        }
    }

    // Actions
    public async saveRules(rules: CourseRule[]) {
        this.rules = rules;
        await AsyncStorage.setItem(STORAGE_KEYS.COURSE_RULES, JSON.stringify(rules));
    }

    public async addRules(newRules: CourseRule[]) {
        const rules = [...this.rules, ...newRules];
        await this.saveRules(rules);
    }

    public async clearRules() {
        await this.saveRules([]);
    }

    public async saveTimeSlots(slots: TimeSlot[]) {
        this.timeSlots = slots;
        await AsyncStorage.setItem(STORAGE_KEYS.TIME_SLOTS, JSON.stringify(slots));
    }

    public async saveSemesterStart(dateStr: string) {
        this.semesterStartDate = dateStr;
        await AsyncStorage.setItem(STORAGE_KEYS.SEMESTER_START, dateStr);
    }

    // Getters
    public getRules() { return this.rules; }
    public getTimeSlots() { return this.timeSlots; }
    public getSemesterStart() { return this.semesterStartDate; }

    // Computed
    public getEvents(): CalendarEvent[] {
        const start = new Date(this.semesterStartDate);
        if (isNaN(start.getTime())) return [];

        return GenerateEvents.generateEvents(this.rules, start, this.timeSlots);
    }
}

export const courseStore = CourseStore.getInstance();
