import mongoose, { isValidObjectId } from 'mongoose';
import { parseDate } from './helper';
import z from 'zod';

// Page size values allowed for pagination
export const PAGE_SIZE_OPTIONS = [50, 100, 150, 200] as const;

// Sort directions: 0 = none, 1 = asc, 2 = desc
export const SORT_DIRECTION_VALUES = [0, 1, 2] as const;

// Schema to validate positive page number
export const pageSchema = z
    .number().int()
    .positive({ message: 'Page must be a positive number greater than 0' })
    .default(1);

// Schema to validate allowed page size values
export const pageSizeSchema = z
    .number().int()
    .refine((val) => PAGE_SIZE_OPTIONS.includes(val as typeof PAGE_SIZE_OPTIONS[number]), {
        message: `Page size must be one of ${PAGE_SIZE_OPTIONS.join(', ')}`,
    })
    .default(PAGE_SIZE_OPTIONS[0]);

// Attendance page size schema
export const attendancePageSizeSchema = z
    .number().int()
    .refine((val) => PAGE_SIZE_OPTIONS.includes(val as typeof PAGE_SIZE_OPTIONS[number]), {
        message: `Page size must be one of ${PAGE_SIZE_OPTIONS.join(', ')}`,
    })
    .default(PAGE_SIZE_OPTIONS[0]);

// Schema to validate sort direction (0 = none, 1 = asc, 2 = desc)
export const sortDirectionSchema = z
    .number().int()
    .refine((val) => SORT_DIRECTION_VALUES.includes(val as typeof SORT_DIRECTION_VALUES[number]), {
        message: `Sort direction must be one of ${SORT_DIRECTION_VALUES.join(', ')}`,
    })
    .default(0);

// Schema to validate and transform ObjectId
export const ObjectIdSchema = z
    .string()
    .refine(isValidObjectId, {
        message: 'Invalid ObjectId',
    })
    .transform((val) => new mongoose.Types.ObjectId(val));

// Schema to validate and transform DD/MM/YYYY date
export const ddmmyyyyDateSchema = z
    .string()
    .regex(/^\d{2}\/\d{2}\/\d{4}$/, { message: 'Date must be in DD/MM/YYYY format' })
    .transform(parseDate);
