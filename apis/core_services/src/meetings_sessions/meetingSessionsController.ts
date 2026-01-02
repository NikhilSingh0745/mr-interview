import { Request, Response, NextFunction } from "express";
import MeetingSession from "./meetingSessionsModel";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";
import { ApiError } from "../core/helper/globalErrorHandler";
import { sendResponse } from "../core/helper/globalResponse";
import {
    CreateMeetingSessionInput,
    UpdateMeetingSessionInput,
    UpdateSessionStatusInput,
    AddParticipantInput
} from "./meetingSessionsValidations";
import { SessionStatus } from "./meetingSessionsTypes";
import { Types } from "mongoose";


// Create Meeting Session
export const createMeetingSession = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const data = req.body as CreateMeetingSessionInput;

        const session = await MeetingSession.create({
            ...data,
            createdBy: req.user?.userId,
            status: SessionStatus.SCHEDULED
        });

        if (!session) {
            throw new ApiError(400, "Meeting session creation failed");
        }

        sendResponse({
            res,
            status: 201,
            message: "Meeting session created successfully",
            data: session
        });
    } catch (err) {
        next(err);
    }
};


// Get all Meeting Sessions (with filters & pagination)
export const getMeetingSessions = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {
            page = 1,
            pageSize = 50,
            meetingDetailsId,
            status,
            startDate,
            endDate,
            isActive,
            isDeleted
        } = req.query;

        const query: any = {};

        if (meetingDetailsId) {
            query.meetingDetailsId = meetingDetailsId;
        }
        if (status) {
            query.status = status;
        }
        if (isActive !== undefined) {
            query.isActive = isActive === 'true';
        }
        if (isDeleted !== undefined) {
            query.isDeleted = isDeleted === 'true';
        }

        // Date range filtering
        if (startDate || endDate) {
            query.scheduledStartTime = {};
            if (startDate) {
                query.scheduledStartTime.$gte = new Date(startDate as string);
            }
            if (endDate) {
                query.scheduledStartTime.$lte = new Date(endDate as string);
            }
        }

        const skip = ((page as number) - 1) * (pageSize as number);

        const [items, total] = await Promise.all([
            MeetingSession.find(query)
                .skip(skip)
                .limit(pageSize as number)
                .populate('meetingDetailsId', 'name description durationMinutes')
                .populate('createdBy', 'fullName email')
                .populate('participants.participantId', 'fullName email')
                .sort({ scheduledStartTime: -1 }),
            MeetingSession.countDocuments(query)
        ]);

        sendResponse({
            res,
            status: 200,
            message: "Meeting sessions fetched successfully",
            data: items,
            pagination: {
                page: page as number,
                pageSize: pageSize as number,
                total,
                totalPages: Math.ceil(total / (pageSize as number))
            }
        });
    } catch (err) {
        next(err);
    }
};

// Get single Meeting Session by ID
export const getMeetingSessionById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        const session = await MeetingSession.findById(id)
            .populate('meetingDetailsId', 'name description durationMinutes timeZone language')
            .populate('createdBy', 'fullName email')
            .populate('updatedBy', 'fullName email')
            .populate('participants.participantId', 'fullName email');

        if (!session) {
            throw new ApiError(404, "Meeting session not found");
        }

        sendResponse({
            res,
            status: 200,
            message: "Meeting session fetched successfully",
            data: session
        });
    } catch (err) {
        next(err);
    }
};

// Update Meeting Session
export const updateMeetingSession = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const updates = req.body as UpdateMeetingSessionInput;

        const session = await MeetingSession.findByIdAndUpdate(
            id,
            {
                ...updates,
                updatedBy: req.user?.userId
            },
            { new: true, runValidators: true }
        )
            .populate('meetingDetailsId', 'name description')
            .populate('participants.participantId', 'fullName email');

        if (!session) {
            throw new ApiError(404, "Meeting session not found");
        }

        sendResponse({
            res,
            status: 200,
            message: "Meeting session updated successfully",
            data: session
        });
    } catch (err) {
        next(err);
    }
};

// Update Session Status
export const updateSessionStatus = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { status, actualStartTime, actualEndTime } = req.body as UpdateSessionStatusInput;

        const updateData: any = {
            status,
            updatedBy: req.user?.userId
        };

        // Set actual times based on status
        if (status === SessionStatus.IN_PROGRESS && actualStartTime) {
            updateData.actualStartTime = actualStartTime;
        }
        if (status === SessionStatus.COMPLETED && actualEndTime) {
            updateData.actualEndTime = actualEndTime;
        }

        const session = await MeetingSession.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!session) {
            throw new ApiError(404, "Meeting session not found");
        }

        sendResponse({
            res,
            status: 200,
            message: `Meeting session status updated to ${status}`,
            data: session
        });
    } catch (err) {
        next(err);
    }
};

// Add Participant to Session
export const addParticipant = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { userId } = req.user!;
        const participantData = req.body as AddParticipantInput;

        const session = await MeetingSession.findById(id);

        if (!session) {
            throw new ApiError(404, "Meeting session not found");
        }

        // Check if session is full
        if (session.participants.length >= session.maxParticipants) {
            throw new ApiError(400, "Session is full, cannot add more participants");
        }

        // Check if participant already exists
        const existingParticipant = session.participants.find(
            p => p.participantId.toString() === participantData.participantId.toString()
        );

        if (existingParticipant) {
            throw new ApiError(400, "Participant already added to this session");
        }

        // Add participant
        session.participants.push({
            ...participantData,
            attendanceStatus: "NO_SHOW"
        } as any);

        session.updatedBy = new Types.ObjectId(userId);
        await session.save();

        sendResponse({
            res,
            status: 200,
            message: "Participant added successfully",
            data: session
        });
    } catch (err) {
        next(err);
    }
};

// Remove Participant from Session
export const removeParticipant = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const { id, participantId } = req.params;
        const { userId } = req.user!;

        const session = await MeetingSession.findById(id);

        if (!session) {
            throw new ApiError(404, "Meeting session not found");
        }

        const participantIndex = session.participants.findIndex(
            p => p.participantId.toString() === participantId
        );

        if (participantIndex === -1) {
            throw new ApiError(404, "Participant not found in this session");
        }

        // Remove participant
        session.participants.splice(participantIndex, 1);
        session.updatedBy = new Types.ObjectId(userId);
        await session.save();

        sendResponse({
            res,
            status: 200,
            message: "Participant removed successfully",
            data: session
        });
    } catch (err) {
        next(err);
    }
};

// Delete Meeting Session (soft delete)
export const deleteMeetingSession = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { userId } = req.user!;

        const session = await MeetingSession.findByIdAndUpdate(
            id,
            {
                isDeleted: true,
                updatedBy: new Types.ObjectId(userId)
            },
            { new: true }
        );

        if (!session) {
            throw new ApiError(404, "Meeting session not found");
        }

        sendResponse({
            res,
            status: 200,
            message: "Meeting session deleted successfully",
            data: session
        });
    } catch (err) {
        next(err);
    }
};
