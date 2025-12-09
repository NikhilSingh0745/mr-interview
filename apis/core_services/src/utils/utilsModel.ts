import mongoose from "mongoose";
import { IUtils, TypeEnum } from "./utilsTypes";

const utilsSchema = new mongoose.Schema<IUtils>({
    name: { type: String, required: true },
    type: { type: String, enum: Object.values(TypeEnum), required: true },
    value: { type: String, required: true },
},
    { timestamps: true }
);

const utilsModel = mongoose.model<IUtils>('utils', utilsSchema);
export default utilsModel;
