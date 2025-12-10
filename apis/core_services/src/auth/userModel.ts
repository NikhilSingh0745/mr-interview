import mongoose, { Types } from "mongoose";
import { IUser } from "./userTypes";

const userSchema = new mongoose.Schema<IUser>(
    {
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },
        gasId: {
            type: Types.ObjectId,
            required: true,
            unique: true
        },
        lastLoggedIn: {
            type: Date
        }
    },
    {
        timestamps: true
    }
);

// Compound unique index to ensure email and gasId combination is unique
userSchema.index({ email: 1, gasId: 1 }, { unique: true });

const User = mongoose.model<IUser>("User", userSchema);
export default User;
