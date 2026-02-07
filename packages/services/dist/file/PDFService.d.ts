import { GridResult } from '../llm/LLMService';
export interface PDFConfig {
    apiBaseUrl: string;
}
export declare class PDFService {
    private config;
    constructor();
    updateConfig(apiBaseUrl: string): void;
    /**
     * Parse PDF via Backend API
     * @param fileData Blob/File object (Web) or object with uri/type/name (RN)
     * @param fileName Name of the file
     */
    parsePDF(fileData: any, fileName?: string): Promise<GridResult>;
}
export declare const pdfService: PDFService;
