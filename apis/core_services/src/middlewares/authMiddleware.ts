import { Request, Response, NextFunction } from "express";
import jwt, { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";
import { config } from "../core/config/config";
import { ApiError } from "../core/helper/globalErrorHandler";
import { HTTP_STATUS } from "../core/helper/globalValidation";

// -------------------------
// Types
// -------------------------

interface JwtPayload {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  gasId: string;
  roles: string;
}

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

const API_KEY = config.get("apikey");
const JWT_SECRET = config.get("backendSecretKey");

// Routes that do not require auth
const PUBLIC_ROUTES = ["/health", "/login", "/gemini/chat"];



// -------------------------
// Middleware Controllers
// -------------------------

/**
 * Controller: Authenticate user using API key or JWT
 * scenarios:
 * 1. Public routes (no auth required)
 * 2. API key authentication (system-level access)
 * 3. JWT authentication
 */
export const authenticateUser = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  try {
    // Allow public routes
    if (PUBLIC_ROUTES.includes(req.path)) {
      return next();
    }

    if (!JWT_SECRET) {
      throw new ApiError(
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        "Authentication configuration error");
    }

    // API key authentication (system-level access)
    const apiKey = req.headers["x-api-key"];
    if (apiKey) {
      if (apiKey !== API_KEY) {
        throw new ApiError(HTTP_STATUS.UNAUTHORIZED, "Invalid API key");
      }

      req.user = {
        userId: "api-key",
        email: "system@internal",
        gasId: "system",
        firstName: "System",
        lastName: "API",
        roles: "ADMIN",
      };
      return next();
    }

    // JWT authentication
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, "Authorization token missing");
    }

    const token = authHeader.slice(7);
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      return next(new ApiError(HTTP_STATUS.UNAUTHORIZED, "Token expired"));
    }

    if (error instanceof JsonWebTokenError) {
      return next(new ApiError(HTTP_STATUS.UNAUTHORIZED, "Invalid authentication token"));
    }

    next(
      error instanceof ApiError
        ? error
        : new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, "Authentication failed")
    );
  }
};


/**
 * Controller: Authorize user access based on roles
 * scenarios:
 * 1. User not authenticated
 * 2. User authenticated but not authorized
 * 3. User authenticated and authorized
 */
export const authorizeAccess =
  (requiredRoles: string | string[]) =>
    (req: AuthenticatedRequest, next: NextFunction): void => {
      if (!req.user) {
        throw new ApiError(HTTP_STATUS.UNAUTHORIZED, "User not authenticated");
      }

      const userRoles = req.user.roles
        .split(",")
        .map((r) => r.trim().toLowerCase());

      const allowedRoles = Array.isArray(requiredRoles)
        ? requiredRoles.map((r) => r.toLowerCase())
        : [requiredRoles.toLowerCase()];

      const hasPermission = allowedRoles.some((role) =>
        userRoles.includes(role)
      );

      if (!hasPermission) {
        throw new ApiError(HTTP_STATUS.FORBIDDEN, "Access denied");
      }

      next();
    };
