// src/validations/question.schema.ts
import { z } from "zod";
import { ObjectIdSchema } from "../core/helper/globalValidation";


// Create Question Schema
export const CreateQuestionSchema = z.object({
    name: z.string().min(1, "Name is required"),
    industryType: z
        .array(ObjectIdSchema)
        .min(1, "At least one industryType is required"),
    question: z.string().min(1, "Question is required"),
    tags: z.array(z.string().max(255)),
    isActive: z.boolean(),
    requiredSample: z
        .number()
        .int()
        .positive("requiredSample must be a positive integer"),

});


// Update Question Schema
export const UpdateQuestionSchema = z.object({
    name: z.string().min(1).optional(),
    industryType: z.array(ObjectIdSchema).min(1).optional(),
    question: z.string().min(1).optional(),
    tags: z.array(z.string().min(1)).min(1).optional(),
    isActive: z.boolean().optional(),
    requiredSample: z
        .number()
        .int()
        .positive("requiredSample must be a positive integer")
        .optional(),
});

export type CreateQuestionInput = z.infer<typeof CreateQuestionSchema>;
export type UpdateQuestionInput = z.infer<typeof UpdateQuestionSchema>;
