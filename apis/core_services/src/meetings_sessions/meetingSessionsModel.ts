import mongoose, { Types } from "mongoose";
import { IMeetingSession, IParticipant, SessionStatus } from "./meetingSessionsTypes";

// Participant sub-schema
const ParticipantSchema = new mongoose.Schema<IParticipant>({
    participantId: { type: Types.ObjectId, required: true, ref: "User" },
    participantName: { type: String, required: true },
    participantEmail: { type: String, required: true },
    joinedAt: { type: Date },
    leftAt: { type: Date },
    attendanceStatus: {
        type: String,
        enum: ["JOINED", "NO_SHOW", "LEFT_EARLY"],
        default: "NO_SHOW"
    }
}, { _id: false });

// Meeting Session schema
const meetingSessionSchema = new mongoose.Schema<IMeetingSession>(
    {
        // Reference to meeting configuration
        meetingDetailsId: {
            type: Types.ObjectId,
            required: true,
            ref: "meeting_details"
        },

        // Session identification
        sessionName: { type: String, required: true },
        sessionDescription: { type: String },

        // Scheduling
        scheduledStartTime: { type: Date, required: true },
        scheduledEndTime: { type: Date, required: true },
        actualStartTime: { type: Date },
        actualEndTime: { type: Date },

        // Participants
        participants: { type: [ParticipantSchema], default: [] },
        maxParticipants: { type: Number, required: true },

        // Session metadata
        status: {
            type: String,
            enum: Object.values(SessionStatus),
            default: SessionStatus.SCHEDULED
        },
        meetingLink: { type: String },
        recordingUrl: { type: String },

        // Notes and feedback
        sessionNotes: { type: String },
        hostNotes: { type: String },

        // Control flags
        isActive: { type: Boolean, required: true, default: true },
        isDeleted: { type: Boolean, required: true, default: false },

        // Ownership & audit
        createdBy: { type: Types.ObjectId, required: true, ref: "User" },
        updatedBy: { type: Types.ObjectId, ref: "User" }
    },
    {
        timestamps: true
    }
);

// Indexes for efficient queries
meetingSessionSchema.index({ meetingDetailsId: 1 });
meetingSessionSchema.index({ status: 1 });
meetingSessionSchema.index({ scheduledStartTime: 1 });
meetingSessionSchema.index({ isActive: 1, isDeleted: 1 });
meetingSessionSchema.index({ createdBy: 1 });
meetingSessionSchema.index({ "participants.participantId": 1 });

// Compound index for date range queries
meetingSessionSchema.index({ scheduledStartTime: 1, scheduledEndTime: 1 });

const MeetingSession = mongoose.model<IMeetingSession>("meeting_sessions", meetingSessionSchema);
export default MeetingSession;
