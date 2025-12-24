import { Types } from "mongoose";

export interface IUser {
    email: string;
    gasId: Types.ObjectId;
    firstName: string;
    lastName: string;
    lastLoggedIn?: Date;
    createdAt: Date;
    updatedAt: Date;
}
