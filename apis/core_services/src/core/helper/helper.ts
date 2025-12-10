import { isValidObjectId } from "mongoose";
import { ApiError } from "./globalErrorHandler";

// Convert 'dd/mm/yyyy' string to Date object
export const parseDate = (dateStr?: string): Date | undefined => {
    if (!dateStr) return undefined;
    const [dd, mm, yyyy] = dateStr.split('/');
    if (!dd || !mm || !yyyy) return undefined;
    return new Date(Number(yyyy), Number(mm) - 1, Number(dd));
};

// Validate date range (fromDate ≤ toDate ≤ today)
export const validateDate = (fromDate?: Date, toDate?: Date): void => {
    const now = new Date();
    if (!fromDate || !toDate) throw new ApiError(400, 'Both From Date and To Date must be provided');
    if (fromDate > toDate) throw new ApiError(400, 'From Date cannot be greater than To Date');
    if (toDate > now) throw new ApiError(400, 'To Date cannot be greater than today');
};

// Return current timestamp in ISO format
export const getCurrentTimestampISO = (): string => new Date().toISOString();

// Generate default date range (last 30 days if none provided)
export const getDefaultDateRange = (startDate?: Date, endDate?: Date) => {
    const end = endDate ?? new Date();
    const start = startDate ?? new Date(end);
    if (!startDate) start.setDate(end.getDate() - 29);
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
    return { start, end };
};

// Format an object into readable change remarks string
export const formatRemarks = (data: Record<string, any>): string => {
    const toTitle = (s: string) => s.replace(/([A-Z])/g, ' $1').replace(/^./, c => c.toUpperCase());

    const format = (val: any): string => {
        if (val == null) return 'N/A';
        if (val instanceof Date && !isNaN(val.getTime()))
            return val.toLocaleDateString('en-GB') + ' ' + val.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

        if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(val)) {
            const d = new Date(val);
            return !isNaN(d.getTime())
                ? d.toLocaleDateString('en-GB', { timeZone: 'UTC' }) + ' ' +
                d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' }) + ' GMT'
                : val;
        }

        if (['string', 'number', 'boolean'].includes(typeof val)) return String(val);
        if (isValidObjectId(val)) return String(val);
        if (Array.isArray(val)) return val.length ? val.map(format).join(', ') : '';
        if (typeof val === 'object') return Object.entries(val).map(([k, v]) => `${k}: ${format(v)}`).join(', ');
        return String(val);
    };

    return Object.entries(data)
        .map(([key, value]) => `${toTitle(key)}: ${format(value)}`)
        .join(', ') || 'No details available';
};
