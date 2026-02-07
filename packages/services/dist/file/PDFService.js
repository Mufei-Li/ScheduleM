"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pdfService = exports.PDFService = void 0;
class PDFService {
    constructor() {
        this.config = {
            apiBaseUrl: ''
        };
    }
    updateConfig(apiBaseUrl) {
        this.config.apiBaseUrl = apiBaseUrl.replace(/\/$/, '');
    }
    /**
     * Parse PDF via Backend API
     * @param fileData Blob/File object (Web) or object with uri/type/name (RN)
     * @param fileName Name of the file
     */
    async parsePDF(fileData, fileName = 'schedule.pdf') {
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
            }
            else {
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
        }
        catch (e) {
            console.error("PDF Parsing Failed:", e);
            return { grid: [], confidence: 0, error: e.message || String(e) };
        }
    }
}
exports.PDFService = PDFService;
exports.pdfService = new PDFService();
