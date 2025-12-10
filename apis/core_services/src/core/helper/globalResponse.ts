import { Response } from "express";


// REDIS CACHED RESPONSE
export interface ICachedResponse {
    success?: boolean;    // Optional, default is true
    status: number;       // Required
    message: string;      // Required
    data: any;              // Required
    pagination?: Meta;          // Optional
}

interface Meta {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

interface ResponseOptions<T> {
    res: Response;
    success?: boolean;    // Optional, default is true
    status: number;       // Required
    message: string;      // Required
    data?: T;              // Required
    pagination?: Meta;          // Optional
}

export const sendResponse = <T>({
    res,
    success = true,
    status,
    message,
    data,
    pagination,
}: ResponseOptions<T>) => {
    const response: Record<string, any> = {
        success: success,
        message,
        data,
    };

    if (pagination !== undefined) {
        response.pagination = pagination;
    }

    res.status(status).json(response);
};

