"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.excelService = exports.ExcelService = void 0;
const XLSX = __importStar(require("xlsx"));
class ExcelService {
    /**
     * Parse Excel file from ArrayBuffer
     * @param buffer ArrayBuffer of the Excel file
     */
    parseExcel(buffer) {
        try {
            const data = new Uint8Array(buffer);
            const workbook = XLSX.read(data, { type: 'array' });
            if (!workbook || !workbook.SheetNames || workbook.SheetNames.length === 0) {
                return { grid: [], error: 'No sheets found' };
            }
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            // Get raw data as 2D array
            const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            if (!rawData || rawData.length === 0) {
                return { grid: [], error: 'Empty sheet' };
            }
            return { grid: rawData, error: null };
        }
        catch (e) {
            return { grid: [], error: e.message || String(e) };
        }
    }
}
exports.ExcelService = ExcelService;
exports.excelService = new ExcelService();
