import app from "./app";
import meetingDetailsRoute from "./meeting_details/meetingDetailsRoute";
import questionsRoute from "./questions/questionsRoute";
import { authenticateUser } from "./middlewares/authMiddleware";
import meetingSessionsRoute from "./meetings_sessions/meetingSessionsRoute";
import authRoute from "./auth/authRoute";
import { Router } from "express";

const router = Router();

// Public routes (no authentication)
router.use('/auth', authRoute);

// Protected routes (require authentication)
router.use('/meeting-details', authenticateUser, meetingDetailsRoute);
router.use('/meeting-sessions', authenticateUser, meetingSessionsRoute);
router.use('/questions', authenticateUser, questionsRoute);


export default router;