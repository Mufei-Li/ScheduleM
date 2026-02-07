export interface LLMConfig {
    baseUrl: string;
    apiKey: string;
    model: string;
}
export interface LLMCourse {
    name: string;
    weeks: number[];
    location: string;
    building: string;
    room: string;
    className: string;
    periodRange: string;
    teacher: string;
    raw_weeks: string;
    weeksRaw?: string;
    nameSpan?: [number, number];
}
export interface LLMResult {
    courses: LLMCourse[];
    confidence: number;
    error: string | null;
    repairs?: any[];
}
export interface GridResult {
    grid: string[][];
    confidence: number;
    error: string | null;
}
export declare class LLMService {
    private config;
    private cache;
    constructor();
    private _debugEnabled;
    private _clip;
    updateConfig(baseUrl: string, apiKey: string, model: string): void;
    /**
     * Standardized Request to LLM
     */
    parseCourse(rawText: string, context?: any): Promise<LLMResult>;
    parseScheduleImageToGrid(imageDataUrl: string, opts?: any): Promise<GridResult>;
    parseWeekString(str: string): number[];
    constructPrompt(rawText: string): string;
    clearCache(): void;
    checkHealth(): Promise<boolean>;
}
export declare const llmService: LLMService;
