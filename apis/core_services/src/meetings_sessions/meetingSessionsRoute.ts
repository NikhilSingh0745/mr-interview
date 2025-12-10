import { Router } from "express";
import {
    createMeetingSession,
    getMeetingSessions,
    getMeetingSessionById,
    updateMeetingSession,
    updateSessionStatus,
    addParticipant,
    removeParticipant,
    deleteMeetingSession
} from "./meetingSessionsController";
import { zodRequestValidator } from "../middlewares/validateMiddleware";
import {
    CreateMeetingSessionSchema,
    UpdateMeetingSessionSchema,
    UpdateSessionStatusSchema,
    AddParticipantSchema,
    GetMeetingSessionsQuerySchema,
    MeetingSessionIdParamSchema,
    ParticipantIdParamSchema
} from "./meetingSessionsValidations";

const router = Router();

/**
 * Meeting Sessions API Routes
 * Base path: /api/meeting-sessions
 * 
 * Query params for GET /:
 *  - page: number (default: 1)
 *  - pageSize: number (default: 50)
 *  - meetingDetailsId: ObjectId
 *  - status: SCHEDULED | IN_PROGRESS | COMPLETED | CANCELLED
 *  - startDate: ISO date string
 *  - endDate: ISO date string
 *  - isActive: boolean
 *  - isDeleted: boolean
 * 
 * Path params:
 *  - id: MeetingSession ObjectId
 *  - participantId: Participant ObjectId
 */

// Create new meeting session
router.post(
    "/",
    zodRequestValidator({ body: CreateMeetingSessionSchema }),
    createMeetingSession
);

// List meeting sessions with filters/pagination
router.get(
    "/",
    zodRequestValidator({ query: GetMeetingSessionsQuerySchema }),
    getMeetingSessions
);

// Get meeting session by ID
router.get(
    "/:id",
    zodRequestValidator({ params: MeetingSessionIdParamSchema }),
    getMeetingSessionById
);

// Update meeting session by ID
router.put(
    "/:id",
    zodRequestValidator({
        params: MeetingSessionIdParamSchema,
        body: UpdateMeetingSessionSchema
    }),
    updateMeetingSession
);

// Update session status
router.patch(
    "/:id/status",
    zodRequestValidator({
        params: MeetingSessionIdParamSchema,
        body: UpdateSessionStatusSchema
    }),
    updateSessionStatus
);

// Add participant to session
router.post(
    "/:id/participants",
    zodRequestValidator({
        params: MeetingSessionIdParamSchema,
        body: AddParticipantSchema
    }),
    addParticipant
);

// Remove participant from session
router.delete(
    "/:id/participants/:participantId",
    zodRequestValidator({ params: ParticipantIdParamSchema }),
    removeParticipant
);

// Soft delete meeting session
router.delete(
    "/:id",
    zodRequestValidator({ params: MeetingSessionIdParamSchema }),
    deleteMeetingSession
);

export default router;
