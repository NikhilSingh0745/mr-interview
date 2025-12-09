import mongoose, { Types } from "mongoose";
import { IMeetingDetails } from "./meetingDetailsTypes";

const meetingDetailsSchema = new mongoose.Schema<IMeetingDetails>({
    name: { type: String, required: true },
    description: { type: String, required: true },
    questionId: { type: Types.ObjectId, required: true, ref: 'Question' },
    additionalQuestionIds: { type: [Types.ObjectId], required: true, ref: 'Question' },
    durationMinutes: { type: Number, required: true },
    maxParticipantsPerSession: { type: Number, required: true },
    timeZone: { type: String, required: true },
    language: { type: String, required: true },
    targetLocation: { type: String, required: true },
    requireAuthentication: { type: Boolean, required: true },
    allowRecording: { type: Boolean, required: true },
    recordingRetentionDays: { type: Number, required: true },
    isActive: { type: Boolean, required: true },
    isDeleted: { type: Boolean, required: true },
    createdBy: { type: Types.ObjectId, required: true },
    updatedBy: { type: Types.ObjectId, required: true },
    createdAt: { type: Date, required: true },
    updatedAt: { type: Date, required: true },
},
    { timestamps: true }
);

const MeetingDetails = mongoose.model<IMeetingDetails>('meeting_details', meetingDetailsSchema);
export default MeetingDetails;
