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



interface ErrorWithStatusCode extends Error {
    statusCode?: number;
}

const globalErrorHandler = (
    err: ErrorWithStatusCode,
    req: Request,
    res: Response,
    _next: NextFunction
) => {
    const statusCode = err.statusCode || 500;

    res.status(statusCode).json({
        success: false,
        code: statusCode,
        message: err.message || 'Internal Server Error',
        error: err.name || 'Error',
    });
};

export default globalErrorHandler;