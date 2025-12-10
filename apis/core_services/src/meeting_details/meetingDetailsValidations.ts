import { z } from "zod";
import { ObjectIdSchema, pageSchema, pageSizeSchema } from "../core/helper/globalValidation";

// Target location schema
const TargetLocationSchema = z.object({
    country: z.string().min(1, "Country is required"),
    city: z.string().min(1, "City is required")
});

// Create Meeting Details Schema
export const CreateMeetingDetailsSchema = z.object({
    name: z.string().min(1, "Name is required").max(255),
    description: z.string().min(1, "Description is required"),
    questionId: ObjectIdSchema,
    additionalQuestionIds: z.array(ObjectIdSchema).default([]),
    durationMinutes: z.number().int().positive("Duration must be a positive integer"),
    maxParticipantsPerSession: z.number().int().positive("Max participants must be a positive integer"),
    timeZone: z.string().min(1, "Time zone is required").default("UTC"),
    language: z.string().min(2).max(10).default("en"),
    targetLocation: TargetLocationSchema,
    requireAuthentication: z.boolean().default(true),
    allowRecording: z.boolean().default(false),
    recordingRetentionDays: z.number().int().positive("Recording retention days must be positive").default(30),
    isActive: z.boolean().default(true)
});

// Update Meeting Details Schema
export const UpdateMeetingDetailsSchema = z.object({
    name: z.string().min(1).max(255).optional(),
    description: z.string().min(1).optional(),
    questionId: ObjectIdSchema.optional(),
    additionalQuestionIds: z.array(ObjectIdSchema).optional(),
    durationMinutes: z.number().int().positive().optional(),
    maxParticipantsPerSession: z.number().int().positive().optional(),
    timeZone: z.string().min(1).optional(),
    language: z.string().min(2).max(10).optional(),
    targetLocation: TargetLocationSchema.optional(),
    requireAuthentication: z.boolean().optional(),
    allowRecording: z.boolean().optional(),
    recordingRetentionDays: z.number().int().positive().optional(),
    isActive: z.boolean().optional()
});

// Query parameters for listing meeting details
export const GetMeetingDetailsQuerySchema = z.object({
    page: pageSchema,
    pageSize: pageSizeSchema,
    isActive: z.boolean().optional(),
    isDeleted: z.boolean().optional()
});

// Path parameter validation
export const MeetingDetailsIdParamSchema = z.object({
    id: ObjectIdSchema
});

// Export types
export type CreateMeetingDetailsInput = z.infer<typeof CreateMeetingDetailsSchema>;
export type UpdateMeetingDetailsInput = z.infer<typeof UpdateMeetingDetailsSchema>;
export type GetMeetingDetailsQuery = z.infer<typeof GetMeetingDetailsQuerySchema>;
