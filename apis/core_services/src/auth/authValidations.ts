import { z } from "zod";
import { ObjectIdSchema } from "../core/helper/globalValidation";

// Login Schema
export const LoginSchema = z.object({
    firstName: z.string()
        .min(2, "First name must be at least 2 characters long")
        .max(20, "First name must be at most 20 characters long"),
    lastName: z.string()
        .min(2, "Last name must be at least 2 characters long")
        .max(20, "Last name must be at most 20 characters long"),
    email: z.email("Valid email is required")
        .max(100, "Email must be at most 100 characters long"),
    gasId: ObjectIdSchema
});

// Export types
export type LoginInput = z.infer<typeof LoginSchema>;
