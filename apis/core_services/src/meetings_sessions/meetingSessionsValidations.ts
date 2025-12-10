import { z } from "zod";
import { ObjectIdSchema, pageSchema, pageSizeSchema } from "../core/helper/globalValidation";
import { SessionStatus } from "./meetingSessionsTypes";

// Participant schema
const ParticipantSchema = z.object({
    participantId: ObjectIdSchema,
    participantName: z.string().min(1, "Participant name is required"),
    participantEmail: z.string().email("Valid email is required"),
    joinedAt: z.date().optional(),
    leftAt: z.date().optional(),
    attendanceStatus: z.enum(["JOINED", "NO_SHOW", "LEFT_EARLY"]).default("NO_SHOW")
});

// Create Meeting Session Schema
export const CreateMeetingSessionSchema = z.object({
    meetingDetailsId: ObjectIdSchema,
    sessionName: z.string().min(1, "Session name is required").max(255),
    sessionDescription: z.string().optional(),
    scheduledStartTime: z.string().or(z.date()).transform((val) => new Date(val)),
    scheduledEndTime: z.string().or(z.date()).transform((val) => new Date(val)),
    maxParticipants: z.number().int().positive("Max participants must be positive"),
    meetingLink: z.string().url().optional(),
    sessionNotes: z.string().optional(),
    hostNotes: z.string().optional()
}).refine(
    (data) => data.scheduledEndTime > data.scheduledStartTime,
    {
        message: "Scheduled end time must be after start time",
        path: ["scheduledEndTime"]
    }
);

// Update Meeting Session Schema
export const UpdateMeetingSessionSchema = z.object({
    sessionName: z.string().min(1).max(255).optional(),
    sessionDescription: z.string().optional(),
    scheduledStartTime: z.string().or(z.date()).transform((val) => new Date(val)).optional(),
    scheduledEndTime: z.string().or(z.date()).transform((val) => new Date(val)).optional(),
    maxParticipants: z.number().int().positive().optional(),
    meetingLink: z.string().url().optional(),
    recordingUrl: z.string().url().optional(),
    sessionNotes: z.string().optional(),
    hostNotes: z.string().optional(),
    isActive: z.boolean().optional()
});

// Update Session Status Schema
export const UpdateSessionStatusSchema = z.object({
    status: z.nativeEnum(SessionStatus),
    actualStartTime: z.string().or(z.date()).transform((val) => new Date(val)).optional(),
    actualEndTime: z.string().or(z.date()).transform((val) => new Date(val)).optional()
});

// Add Participant Schema
export const AddParticipantSchema = z.object({
    participantId: ObjectIdSchema,
    participantName: z.string().min(1, "Participant name is required"),
    participantEmail: z.string().email("Valid email is required")
});

// Query parameters for listing sessions
export const GetMeetingSessionsQuerySchema = z.object({
    page: pageSchema,
    pageSize: pageSizeSchema,
    meetingDetailsId: ObjectIdSchema.optional(),
    status: z.nativeEnum(SessionStatus).optional(),
    startDate: z.string().or(z.date()).transform((val) => new Date(val)).optional(),
    endDate: z.string().or(z.date()).transform((val) => new Date(val)).optional(),
    isActive: z.boolean().optional(),
    isDeleted: z.boolean().optional()
});

// Path parameter validation
export const MeetingSessionIdParamSchema = z.object({
    id: ObjectIdSchema
});

export const ParticipantIdParamSchema = z.object({
    id: ObjectIdSchema,
    participantId: ObjectIdSchema
});

// Export types
export type CreateMeetingSessionInput = z.infer<typeof CreateMeetingSessionSchema>;
export type UpdateMeetingSessionInput = z.infer<typeof UpdateMeetingSessionSchema>;
export type UpdateSessionStatusInput = z.infer<typeof UpdateSessionStatusSchema>;
export type AddParticipantInput = z.infer<typeof AddParticipantSchema>;
export type GetMeetingSessionsQuery = z.infer<typeof GetMeetingSessionsQuerySchema>;
