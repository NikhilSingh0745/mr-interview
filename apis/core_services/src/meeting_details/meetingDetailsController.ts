import { Request, Response, NextFunction } from "express";
import MeetingDetails from "./meetingsDetailsModel";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";
import { ApiError } from "../core/helper/globalErrorHandler";
import { sendResponse } from "../core/helper/globalResponse";
import { CreateMeetingDetailsInput, UpdateMeetingDetailsInput } from "./meetingDetailsValidations";


// Create Meeting Details
export const createMeetingDetails = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const data = req.body as CreateMeetingDetailsInput;

        const meetingDetails = await MeetingDetails.create({
            ...data,
            createdBy: req.user?._id
        });

        if (!meetingDetails) {
            throw new ApiError(400, "Meeting details creation failed");
        }

        sendResponse({
            res,
            status: 201,
            message: "Meeting details created successfully",
            data: meetingDetails
        });
    } catch (err) {
        next(err);
    }
};

// Get all Meeting Details (with filters & pagination)
export const getMeetingDetails = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { page = 1, pageSize = 50, isActive, isDeleted } = req.query;

        const query: any = {};
        if (isActive !== undefined) {
            query.isActive = isActive === 'true';
        }
        if (isDeleted !== undefined) {
            query.isDeleted = isDeleted === 'true';
        }

        const skip = ((page as number) - 1) * (pageSize as number);

        const [items, total] = await Promise.all([
            MeetingDetails.find(query)
                .skip(skip)
                .limit(pageSize as number)
                .populate('questionId', 'name question')
                .populate('additionalQuestionIds', 'name question')
                .populate('createdBy', 'fullName email')
                .sort({ createdAt: -1 }),
            MeetingDetails.countDocuments(query)
        ]);

        sendResponse({
            res,
            status: 200,
            message: "Meeting details fetched successfully",
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

// Get single Meeting Details by ID
export const getMeetingDetailsById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        const meetingDetails = await MeetingDetails.findById(id)
            .populate('questionId', 'name question')
            .populate('additionalQuestionIds', 'name question')
            .populate('createdBy', 'fullName email')
            .populate('updatedBy', 'fullName email');

        if (!meetingDetails) {
            throw new ApiError(404, "Meeting details not found");
        }

        sendResponse({
            res,
            status: 200,
            message: "Meeting details fetched successfully",
            data: meetingDetails
        });
    } catch (err) {
        next(err);
    }
};

// Update Meeting Details
export const updateMeetingDetails = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const updates = req.body as UpdateMeetingDetailsInput;

        const meetingDetails = await MeetingDetails.findByIdAndUpdate(
            id,
            {
                ...updates,
                updatedBy: req.user?._id
            },
            { new: true, runValidators: true }
        )
            .populate('questionId', 'name question')
            .populate('additionalQuestionIds', 'name question');

        if (!meetingDetails) {
            throw new ApiError(404, "Meeting details not found");
        }

        sendResponse({
            res,
            status: 200,
            message: "Meeting details updated successfully",
            data: meetingDetails
        });
    } catch (err) {
        next(err);
    }
};

// Delete Meeting Details (soft delete)
export const deleteMeetingDetails = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        const meetingDetails = await MeetingDetails.findByIdAndUpdate(
            id,
            {
                isDeleted: true,
                updatedBy: req.user?._id
            },
            { new: true }
        );

        if (!meetingDetails) {
            throw new ApiError(404, "Meeting details not found");
        }

        sendResponse({
            res,
            status: 200,
            message: "Meeting details deleted successfully",
            data: meetingDetails
        });
    } catch (err) {
        next(err);
    }
};
