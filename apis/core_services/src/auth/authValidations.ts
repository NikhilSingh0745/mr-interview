import { z } from "zod";
import { ObjectIdSchema } from "../core/helper/globalValidation";

// Login Schema
export const LoginSchema = z.object({
    email: z.string().email("Valid email is required"),
    gasId: ObjectIdSchema
});

// Export types
export type LoginInput = z.infer<typeof LoginSchema>;
