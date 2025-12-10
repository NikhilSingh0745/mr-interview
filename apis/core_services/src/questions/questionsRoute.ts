import { Router } from "express";
import {
    createQuestion,
    getQuestions,
    getQuestionById,
    updateQuestion,
    deleteQuestion,
} from "./questionsController";

const router = Router();

/**
 * Questions API Routes
 * Base path: /api/questions
 * 
 * Query params for GET /:
 *  - page: number (default: 1)
 *  - limit: number (default: 20) 
 *  - isActive: boolean
 * 
 * Path params:
 *  - id: Question ObjectId (required for GET/PUT/DELETE /:id)
 */

router.post("/", createQuestion);          // Create new question
router.get("/", getQuestions);             // List with filters/pagination
router.get("/:id", getQuestionById);       // Get question by ID
router.put("/:id", updateQuestion);        // Update question by ID  
router.delete("/:id", deleteQuestion);     // Delete question by ID

export default router;
