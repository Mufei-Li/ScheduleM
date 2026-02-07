import * as XLSX from 'xlsx';

export interface ExcelParseResult {
    grid: any[][];
    error: string | null;
}

export class ExcelService {
    /**
     * Parse Excel file from ArrayBuffer
     * @param buffer ArrayBuffer of the Excel file
     */
    public parseExcel(buffer: ArrayBuffer): ExcelParseResult {
        try {
            const data = new Uint8Array(buffer);
            const workbook = XLSX.read(data, { type: 'array' });

            if (!workbook || !workbook.SheetNames || workbook.SheetNames.length === 0) {
                return { grid: [], error: 'No sheets found' };
            }

            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            
            // Get raw data as 2D array
            const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

            if (!rawData || rawData.length === 0) {
                return { grid: [], error: 'Empty sheet' };
            }

            return { grid: rawData, error: null };
        } catch (e: any) {
            return { grid: [], error: e.message || String(e) };
        }
    }
}

export const excelService = new ExcelService();
