import { Router } from "express";
import { login } from "./authController";
import { zodRequestValidator } from "../middlewares/validateMiddleware";
import { LoginSchema } from "./authValidations";

const router = Router();

/**
 * Auth API Routes
 * Base path: /api/auth
 * 
 * These routes are public and do not require authentication
 * used zodRequestValidator for request validation in middleware
 */

// Login endpoint
router.post(
    "/login",
    zodRequestValidator({ body: LoginSchema }),
    login
);

export default router;
