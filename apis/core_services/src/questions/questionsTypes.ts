import { Types } from "mongoose";

export interface IQuestion {
    name: string,
    industryType: Types.ObjectId[],
    question: string,
    tags: string[],
    requireAuthentication: boolean,
    isActive: boolean,
    requiredSample: number,
    createdBy: Types.ObjectId,
    createdAt: Date,
    updatedAt: Date,
}