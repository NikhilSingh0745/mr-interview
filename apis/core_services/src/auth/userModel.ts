import mongoose, { Types } from "mongoose";
import { IUser } from "./userTypes";

const userSchema = new mongoose.Schema<IUser>(
    {
        firstName: {
            type: String,
            required: true,
            trim: true
        },
        lastName: {
            type: String,
            required: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            lowercase: true,
            trim: true
        },
        gasId: { type: Types.ObjectId, required: true },
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
userSchema.index({ gasId: 1 }, { unique: true });
userSchema.index({ email: 1 }, { unique: true });

const User = mongoose.model<IUser>("User", userSchema);
export default User;
