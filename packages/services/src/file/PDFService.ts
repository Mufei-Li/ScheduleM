import { GridResult } from '../llm/LLMService';

export interface PDFConfig {
    apiBaseUrl: string;
}

export class PDFService {
    private config: PDFConfig;

    constructor() {
        this.config = {
            apiBaseUrl: ''
        };
    }

    public updateConfig(apiBaseUrl: string) {
        this.config.apiBaseUrl = apiBaseUrl.replace(/\/$/, '');
    }

    /**
     * Parse PDF via Backend API
     * @param fileData Blob/File object (Web) or object with uri/type/name (RN)
     * @param fileName Name of the file
     */
    public async parsePDF(fileData: any, fileName: string = 'schedule.pdf'): Promise<GridResult> {
        if (!this.config.apiBaseUrl) {
            return { grid: [], confidence: 0, error: 'PDF API not configured' };
        }

        try {
            const formData = new FormData();
            
            // Handle React Native format
            if (fileData && typeof fileData === 'object' && 'uri' in fileData) {
                 // @ts-ignore - React Native FormData expects this structure
                formData.append('file', {
                    uri: fileData.uri,
                    type: fileData.type || 'application/pdf',
                    name: fileData.name || fileName
                });
            } else {
                // Web Blob/File
                formData.append('file', fileData, fileName);
            }

            const url = `${this.config.apiBaseUrl}/api/parse-pdf`;
            const response = await fetch(url, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error(`PDF API Error: ${response.status}`);
            }

            const data = await response.json();
            
            if (data && Array.isArray(data.grid)) {
                return { grid: data.grid, confidence: 1.0, error: null };
            }
            
            return { grid: [], confidence: 0, error: 'Invalid response from PDF API' };

        } catch (e: any) {
            console.error("PDF Parsing Failed:", e);
            return { grid: [], confidence: 0, error: e.message || String(e) };
        }
    }
}

export const pdfService = new PDFService();
