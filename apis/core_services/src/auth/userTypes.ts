import { Types } from "mongoose";

export interface IUser {
    email: string;
    gasId: Types.ObjectId;
    lastLoggedIn?: Date;
    createdAt: Date;
    updatedAt: Date;
}
