import { Router } from "express";
import {
    createMeetingDetails,
    getMeetingDetails,
    getMeetingDetailsById,
    updateMeetingDetails,
    deleteMeetingDetails
} from "./meetingDetailsController";
import { zodRequestValidator } from "../middlewares/validateMiddleware";
import {
    CreateMeetingDetailsSchema,
    UpdateMeetingDetailsSchema,
    GetMeetingDetailsQuerySchema,
    MeetingDetailsIdParamSchema
} from "./meetingDetailsValidations";

const router = Router();

/**
 * Meeting Details API Routes
 * Base path: /api/meeting-details
 * 
 * Query params for GET /:
 *  - page: number (default: 1)
 *  - pageSize: number (default: 50)
 *  - isActive: boolean
 *  - isDeleted: boolean
 * 
 * Path params:
 *  - id: MeetingDetails ObjectId (required for GET/PUT/DELETE /:id)
 */

// Create new meeting details
router.post(
    "/",
    zodRequestValidator({ body: CreateMeetingDetailsSchema }),
    createMeetingDetails
);

// List meeting details with filters/pagination
router.get(
    "/",
    zodRequestValidator({ query: GetMeetingDetailsQuerySchema }),
    getMeetingDetails
);

// Get meeting details by ID
router.get(
    "/:id",
    zodRequestValidator({ params: MeetingDetailsIdParamSchema }),
    getMeetingDetailsById
);

// Update meeting details by ID
router.put(
    "/:id",
    zodRequestValidator({
        params: MeetingDetailsIdParamSchema,
        body: UpdateMeetingDetailsSchema
    }),
    updateMeetingDetails
);

// Soft delete meeting details by ID
router.delete(
    "/:id",
    zodRequestValidator({ params: MeetingDetailsIdParamSchema }),
    deleteMeetingDetails
);

export default router;
