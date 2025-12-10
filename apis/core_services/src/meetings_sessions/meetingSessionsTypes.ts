import { Types } from "mongoose";

// Session status enum
export enum SessionStatus {
    SCHEDULED = "SCHEDULED",
    IN_PROGRESS = "IN_PROGRESS",
    COMPLETED = "COMPLETED",
    CANCELLED = "CANCELLED"
}

// Participant interface
export interface IParticipant {
    participantId: Types.ObjectId;
    participantName: string;
    participantEmail: string;
    joinedAt?: Date;
    leftAt?: Date;
    attendanceStatus: "JOINED" | "NO_SHOW" | "LEFT_EARLY";
}

// Meeting Session interface
export interface IMeetingSession {
    // Reference to meeting configuration
    meetingDetailsId: Types.ObjectId;

    // Session identification
    sessionName: string;
    sessionDescription?: string;

    // Scheduling
    scheduledStartTime: Date;
    scheduledEndTime: Date;
    actualStartTime?: Date;
    actualEndTime?: Date;

    // Participants
    participants: IParticipant[];
    maxParticipants: number;

    // Session metadata
    status: SessionStatus;
    meetingLink?: string;
    recordingUrl?: string;

    // Notes and feedback
    sessionNotes?: string;
    hostNotes?: string;

    // Control flags
    isActive: boolean;
    isDeleted: boolean;

    // Ownership & audit
    createdBy: Types.ObjectId;
    updatedBy?: Types.ObjectId;

    createdAt: Date;
    updatedAt: Date;
}
