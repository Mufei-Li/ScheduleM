export interface LocationInfo {
    location: string;
    building: string;
    room: string;
    _truncated?: string;
}
export declare const standardizeLocation: (loc: string) => LocationInfo;
