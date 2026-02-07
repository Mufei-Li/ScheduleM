export interface ExcelParseResult {
    grid: any[][];
    error: string | null;
}
export declare class ExcelService {
    /**
     * Parse Excel file from ArrayBuffer
     * @param buffer ArrayBuffer of the Excel file
     */
    parseExcel(buffer: ArrayBuffer): ExcelParseResult;
}
export declare const excelService: ExcelService;
