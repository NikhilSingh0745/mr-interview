import { Request, Response, NextFunction } from "express";
import jwt, {
  JwtPayload as DefaultJwtPayload,
  JsonWebTokenError,
  TokenExpiredError,
} from "jsonwebtoken";
import { config } from "../core/config/config";
import { ApiError } from "../core/helper/globalErrorHandler";

interface JwtPayload extends DefaultJwtPayload {
  empId: string;
  fullName: string;
  designation?: string;
  locationId?: string;
  email: string;
  orgId: string;
  roles: string;
}

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}


// Middleware to authenticate user using JWT
const API_KEY = config.get('apikey');
const JWT_SECRET = config.get('backendSecretKey');

// Define public routes that do not require authentication
const PUBLIC_ROUTES = [''];


// Authentication Middleware
export const authenticateUser = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    // Allow public routes
    if (PUBLIC_ROUTES.includes(req.path)) {
      return next();
    }

    // Environment validation
    if (!API_KEY || !JWT_SECRET) {
      return next(new ApiError(500, "Authentication configuration is missing."));
    }

    // API-key Authentication
    const apiKey = req.headers["x-api-key"] as string;
    if (apiKey && apiKey === API_KEY) {
      req.user = {
        empId: "api-key-user",
        email: "developer@system.internal",
        orgId: "system",
        fullName: "System Developer (API Key)",
        roles: 'TEST',
        apiKey: true,
      };
      return next();
    }

    // JWT Authentication
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      return next(new ApiError(401, "Authorization header missing or malformed."));
    }

    const token = authHeader.replace("Bearer ", "");

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
      req.user = decoded;
      return next();
    } catch (err) {
      if (err instanceof TokenExpiredError) {
        console.warn(`Authentication failed: Token expired at ${err.expiredAt}`);
        return next(new ApiError(401, "Authentication failed: Token has expired."));
      }

      if (err instanceof JsonWebTokenError) {
        return next(new ApiError(401, `Authentication failed: ${err.message}`));
      }

      console.error("Unexpected JWT verification error:", err);
      return next(new ApiError(500, "Unexpected JWT verification error."));
    }

  } catch (error) {
    console.error("Authentication middleware error:", error);
    return next(new ApiError(500, "Authentication processing failed."));
  }
};


// Middleware to authorize access based on user roles
export function authorizeAccess(roles: string | string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !req.user.roles) {
      throw new ApiError(401, "User not authenticated.");
    }
    const userRoles = req.user.roles
      .split(",")
      .map((r) => r.trim().toLowerCase());
    const requiredRoles = Array.isArray(roles)
      ? roles.map((r) => r.toLowerCase())
      : [roles.toLowerCase()];
    const hasAccess = requiredRoles.some((role) => userRoles.includes(role));

    if (!hasAccess) {
      throw new ApiError(403, "Access denied: insufficient permissions.");
    }
    next();
  };
}
