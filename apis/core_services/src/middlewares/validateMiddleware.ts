import { Request, Response, NextFunction } from "express";
import { z, ZodSchema } from "zod";

type ValidationSchemas = {
    body?: ZodSchema;
    params?: ZodSchema;
    query?: ZodSchema;
};

const applyStrict = (schema: ZodSchema) => {
    return "strict" in schema ? (schema as any).strict() : schema;
};

export const zodRequestValidator = (schemas: ValidationSchemas) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            if (schemas.body) req.body = applyStrict(schemas.body).parse(req.body);
            if (schemas.params) req.params = applyStrict(schemas.params).parse(req.params);
            if (schemas.query) req.query = applyStrict(schemas.query).parse(req.query);

            next();
        } catch (err) {
            if (err instanceof z.ZodError) {
                return res.status(400).json({
                    success: false,
                    message: "Validation error",
                    errors: err.issues.map(({ path, message }) => ({
                        field: path.join("."),
                        message
                    }))
                });
            }

            return res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    };
};