import meetingDetailsRoute from "./meeting_details/meetingDetailsRoute";
import questionsRoute from "./questions/questionsRoute";
import meetingSessionsRoute from "./meetings_sessions/meetingSessionsRoute";
import authRoute from "./auth/authRoute";
import { Router } from "express";

const router = Router();

// Public routes (no authentication)
router.use('/auth', authRoute);

// Protected routes (require authentication)
router.use('/meeting-details', meetingDetailsRoute);
router.use('/meeting-sessions', meetingSessionsRoute);
router.use('/questions', questionsRoute);


export default router;