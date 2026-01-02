import { Request, Response, NextFunction } from "express";
import MeetingDetails from "./meetingsDetailsModel";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";
import { ApiError } from "../core/helper/globalErrorHandler";
import { sendResponse } from "../core/helper/globalResponse";
import { CreateMeetingDetailsInput, GetMeetingDetailsQuery, UpdateMeetingDetailsInput } from "./meetingDetailsValidations";
import { HTTP_STATUS } from "../core/helper/globalValidation";
import { PipelineStage } from "mongoose";


// Create Meeting Details
export const createMeetingDetails = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const data = req.body as CreateMeetingDetailsInput;

        const meetingDetails = await MeetingDetails.create({
            ...data,
            createdBy: req.user?.userId
        });

        if (!meetingDetails) {
            throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Meeting details creation failed");
        }

        sendResponse({
            res,
            status: HTTP_STATUS.CREATED,
            message: "Meeting details created successfully",
            data: meetingDetails
        });
    } catch (err) {
        next(err);
    }
};


// Get Meeting Details
export const getMeetingDetails = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const { page, pageSize, isActive, isDeleted } = req.query as unknown as GetMeetingDetailsQuery;
        const skip = (page - 1) * pageSize;

        const matchStage: Record<string, boolean> = {};

        if (isActive) {
            matchStage.isActive = isActive;
        }

        if (isDeleted) {
            matchStage.isDeleted = isDeleted;
        }

        const pipeline: PipelineStage[] = [
            { $match: matchStage },

            // Join main question
            {
                $lookup: {
                    from: "questions",
                    let: { questionId: "$questionId" },
                    pipeline: [
                        { $match: { $expr: { $eq: ["$_id", "$$questionId"] } } },
                        { $project: { name: 1, question: 1 } }
                    ],
                    as: "question"
                }
            },
            { $unwind: { path: "$question", preserveNullAndEmptyArrays: true } },

            // Join additional questions
            {
                $lookup: {
                    from: "questions",
                    let: { ids: "$additionalQuestionIds" },
                    pipeline: [
                        { $match: { $expr: { $in: ["$_id", "$$ids"] } } },
                        { $project: { name: 1, question: 1 } }
                    ],
                    as: "additionalQuestions"
                }
            },

            // Join creator
            {
                $lookup: {
                    from: "users",
                    let: { userId: "$createdBy" },
                    pipeline: [
                        { $match: { $expr: { $eq: ["$_id", "$$userId"] } } },
                        { $project: { fullName: 1, email: 1 } }
                    ],
                    as: "createdBy"
                }
            },
            { $unwind: { path: "$createdBy", preserveNullAndEmptyArrays: true } },

            // Sort
            { $sort: { createdAt: -1 } },

            // Pagination + total count
            {
                $facet: {
                    data: [
                        { $skip: skip },
                        { $limit: pageSize }
                    ],
                    total: [
                        { $count: "count" }
                    ]
                }
            }
        ];

        const result = await MeetingDetails.aggregate(pipeline);

        const items = result[0]?.data ?? [];
        const total = result[0]?.total?.[0]?.count ?? 0;

        sendResponse({
            res,
            status: HTTP_STATUS.OK,
            message: "Meeting details fetched successfully",
            data: items,
            pagination: {
                page,
                pageSize,
                total,
                totalPages: Math.ceil(total / pageSize)
            }
        });
    } catch (error) {
        next(error);
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
                updatedBy: req.user?.userId
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
                updatedBy: req.user?.userId
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
