import mongoose, { Types } from "mongoose";
import { IQuestion } from "./questionsTypes";

// Schema
const QuestionSchema = new mongoose.Schema<IQuestion>({
    name: { type: String, required: true },
    industryType: { type: [Types.ObjectId], required: true, ref: 'utils' },
    question: { type: String, required: true },
    tags: { type: [String], required: true },
    isActive: { type: Boolean, required: true, default: true },
    requiredSample: { type: Number, required: true },
    createdBy: { type: Types.ObjectId, required: true },
}, { timestamps: true });


// Indexes
QuestionSchema.index({ industryType: 1 });
QuestionSchema.index({ isActive: 1 });

const Question = mongoose.model<IQuestion>('Question', QuestionSchema);
export default Question;
