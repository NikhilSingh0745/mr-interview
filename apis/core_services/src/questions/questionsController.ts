// src/controllers/questionController.ts
import { Request, Response, NextFunction } from "express";
import Question from "./questionsModel";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";
import { IQuestion } from "./questionsTypes";
import { ApiError } from "../core/helper/globalErrorHandler";
import { sendResponse } from "../core/helper/globalResponse";


// Create Question
export const createQuestion = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const { name, industryType, question, tags, requiredSample } = req.body as IQuestion;

        const createdQuestion = await Question.create({
            name,
            industryType,
            question,
            tags,
            requiredSample,
            createdBy: req.user?._id,
        });

        if (!createdQuestion) {
            throw new ApiError(400, "Question creation failed");
        }

        sendResponse({
            res,
            status: 201,
            message: "Question created successfully",
            data: createdQuestion,
        })
    } catch (err) {
        next(err);
    }
};


// Get all Questions (with basic filters & pagination)
export const getQuestions = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { page = 1, pageSize = 10 } = req.body;
        const skip = (page as number - 1) * pageSize;

        const [items, total] = await Promise.all([
            Question.find().skip(skip).limit(pageSize).sort({ createdAt: -1 }),
            Question.countDocuments(),
        ]);

        sendResponse({
            res,
            status: 200,
            message: "Questions fetched successfully",
            data: items,
            pagination: {
                page,
                pageSize,
                total,
                totalPages: Math.ceil(total / pageSize),
            },
        });
    } catch (err) {
        next(err);
    }
};


// Get single Question by id
export const getQuestionById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const question = await Question.findById(id);

        if (!question) {
            throw new ApiError(404, "Question not found");
        }

        sendResponse({
            res,
            status: 200,
            message: "Question fetched successfully",
            data: question,
        });
    } catch (err) {
        next(err);
    }
};


// Update Question
export const updateQuestion = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const updates: Partial<IQuestion> = req.body;

        const question = await Question.findByIdAndUpdate(id, updates, {
            new: true,
            runValidators: true,
        });

        if (!question) {
            throw new ApiError(404, "Question not found");
        }

        sendResponse({
            res,
            status: 200,
            message: "Question updated successfully",
            data: question,
        });
    } catch (err) {
        next(err);
    }
};


// Delete Question (hard delete)
export const deleteQuestion = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        const question = await Question.findByIdAndDelete(id);

        if (!question) {
            throw new ApiError(404, "Question not found");
        }

        sendResponse({
            res,
            status: 200,
            message: "Question deleted successfully",
        });
    } catch (err) {
        next(err);
    }
};
