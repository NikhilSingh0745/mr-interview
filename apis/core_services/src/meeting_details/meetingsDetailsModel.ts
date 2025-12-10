import mongoose, { Types } from "mongoose";
import { IMeetingDetails } from "./meetingDetailsTypes";

// Meeting configuration / metadata
const meetingDetailsSchema = new mongoose.Schema<IMeetingDetails>(
    {
        // Basic info
        name: { type: String, required: true },
        description: { type: String, required: true },

        // Question linkage
        questionId: { type: Types.ObjectId, required: true, ref: "Question" },
        additionalQuestionIds: { type: [Types.ObjectId], default: [], ref: "Question" },

        // Session configuration
        durationMinutes: { type: Number, required: true },
        maxParticipantsPerSession: { type: Number, required: true },
        timeZone: { type: String, required: true, default: "UTC" },
        language: { type: String, required: true, default: "en" },

        // Targeting / rules
        targetLocation: {
            country: { type: String, required: true },
            city: { type: String, required: true }
        },
        requireAuthentication: { type: Boolean, required: true, default: true },
        allowRecording: { type: Boolean, required: true, default: false },
        recordingRetentionDays: { type: Number, required: true, default: 30 },

        // Flags
        isActive: { type: Boolean, required: true, default: true },
        isDeleted: { type: Boolean, required: true, default: false },

        // Audit
        createdBy: { type: Types.ObjectId, required: true, ref: "User" },
        updatedBy: { type: Types.ObjectId, ref: "User" }
    },
    {
        timestamps: true
    }
);

// Indexes for common queries
meetingDetailsSchema.index({ questionId: 1 });
meetingDetailsSchema.index({ isActive: 1, isDeleted: 1 });
meetingDetailsSchema.index({ createdBy: 1 });

const MeetingDetails = mongoose.model<IMeetingDetails>("meeting_details", meetingDetailsSchema);
export default MeetingDetails;
