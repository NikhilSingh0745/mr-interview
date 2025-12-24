import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "./userModel";
import { ApiError } from "../core/helper/globalErrorHandler";
import { sendResponse } from "../core/helper/globalResponse";
import { config } from "../core/config/config";
import { IUser } from "./userTypes";
import { HTTP_STATUS } from "../core/helper/globalValidation";


// ============================================================================
// Constants (Auth Controller, Response Messages)
// ============================================================================

const AUTH_ERROR_MESSAGES = {
    CREDENTIALS_MISMATCH: "Email and Gas Id belong to different users",
    EMAIL_MISMATCH: "Gas Id exists but email does not match",
    GASID_MISMATCH: "Email exists but Gas Id does not match",
    JWT_SECRET_MISSING: "Authentication configuration error",
    DUPLICATE_EMAIL: "Email already exists",
    DUPLICATE_GASID: "Gas Id already exists",
} as const;

const SUCCESS_MESSAGES = {
    LOGIN_SUCCESS: "Login successful",
    USER_CREATED: "User created and logged in successfully",
} as const;

const JWT_SECRET = config.get("backendSecretKey");
const JWT_EXPIRES_IN = "7d";


// ============================================================================
// Controllers
// ============================================================================

/**
 * Login Controller
 *
 * Scenarios:
 * 1. Email + GasId match same user → Login
 * 2. Email exists but GasId mismatch → Error
 * 3. GasId exists but Email mismatch → Error
 * 4. Email & GasId belong to different users → Error
 * 5. Neither exists → Create new user
 */
export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { firstName, lastName, email, gasId } = req.body as IUser;

        if (!email || !gasId) {
            throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Email and Gas Id are required");
        }

        if (!JWT_SECRET) {
            throw new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, AUTH_ERROR_MESSAGES.JWT_SECRET_MISSING);
        }

        // Try login (atomic update)
        let user = await User.findOneAndUpdate(
            { email, gasId },
            { lastLoggedIn: new Date() },
            { new: true }
        );

        let isNewUser = false;

        // Create user if not found
        if (!user) {
            try {
                user = await User.create({
                    firstName,
                    lastName,
                    email,
                    gasId,
                    lastLoggedIn: new Date(),
                });
                isNewUser = true;
            } catch (err: unknown) {
                if (
                    err instanceof Error &&
                    "code" in err &&
                    (err as { code: number }).code === 11000
                ) {
                    const field = Object.keys(
                        (err as unknown as { keyPattern: Record<string, number> }).keyPattern
                    )[0];

                    throw new ApiError(
                        HTTP_STATUS.BAD_REQUEST,
                        field === "email"
                            ? AUTH_ERROR_MESSAGES.GASID_MISMATCH
                            : AUTH_ERROR_MESSAGES.EMAIL_MISMATCH
                    );
                }
                throw err;
            }
        }

        // Generate token
        const token = jwt.sign(
            {
                userId: user._id.toString(),
                email: user.email,
                gasId: user.gasId,
                firstName: user.firstName,
                lastName: user.lastName,
            },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        sendResponse({
            res,
            status: isNewUser ? HTTP_STATUS.CREATED : HTTP_STATUS.OK,
            message: isNewUser ? SUCCESS_MESSAGES.USER_CREATED : SUCCESS_MESSAGES.LOGIN_SUCCESS,
            data: {
                token,
                name: `${user.firstName} ${user.lastName}`.trim(),
                lastLoggedIn: user.lastLoggedIn,
            },
        });
    } catch (error) {
        next(error);
    }
};