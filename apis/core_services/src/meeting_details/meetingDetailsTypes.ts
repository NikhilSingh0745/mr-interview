import { Types } from "mongoose";

export interface IMeetingDetails {
    // Basic info
    name: string;
    description: string;

    // Question linkage
    questionId: Types.ObjectId;
    additionalQuestionIds: Types.ObjectId[];

    // Meeting configuration
    durationMinutes: number;
    maxParticipantsPerSession: number;
    timeZone: string;
    language: string;

    // Target & metadata
    targetLocation: {
        country: string,
        city: string,
    }

    // Access & recording
    requireAuthentication: boolean;
    allowRecording: boolean;
    recordingRetentionDays: number;

    // Control flags
    isActive: boolean;
    isDeleted: boolean;

    // Ownership & audit
    createdBy: Types.ObjectId;
    updatedBy?: Types.ObjectId;

    createdAt: Date;
    updatedAt: Date;
}
