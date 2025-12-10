// src/middleware/errorHandler.ts
import { NextFunction, Request, Response } from "express";


export class ApiError extends Error {
    statusCode: number;
    isOperational: boolean;
    details?: unknown;

    constructor(statusCode: number, message: string, details?: unknown) {
        super(message);
        Object.setPrototypeOf(this, new.target.prototype);

        this.statusCode = statusCode;
        this.isOperational = statusCode < 500;
        this.details = details;

        Error.captureStackTrace(this, this.constructor);
    }
}


export const globalErrorHandler = (err: Error | ApiError, req: Request, res: Response, next: NextFunction) => {
    const isApiError = err instanceof ApiError;

    const statusCode = isApiError ? err.statusCode : 500;
    const message =
        isApiError && err.isOperational
            ? err.message
            : "Something went wrong. Please try again later.";

    // Centralized logging (plug in Winston / Pino / Sentry here)
    console.error("[ERROR]", {
        method: req.method,
        url: req.originalUrl,
        statusCode,
        message: err.message,
        stack: err.stack,
    });

    const responseBody: any = {
        success: false,
        message,
    };

    if (process.env.NODE_ENV !== "production" && isApiError && err.details) {
        responseBody.details = err.details;
    }

    res.status(statusCode).json(responseBody);
};
