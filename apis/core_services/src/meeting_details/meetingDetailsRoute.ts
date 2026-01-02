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

/* Meeting Details Routes
* Base path: /api/meeting-details
*/

router.post("/", zodRequestValidator({ body: CreateMeetingDetailsSchema }), createMeetingDetails);
router.get("/", zodRequestValidator({ query: GetMeetingDetailsQuerySchema }), getMeetingDetails);
router.get("/:id", zodRequestValidator({ params: MeetingDetailsIdParamSchema }), getMeetingDetailsById);
router.put("/:id", zodRequestValidator({ params: MeetingDetailsIdParamSchema, body: UpdateMeetingDetailsSchema }), updateMeetingDetails);
router.delete("/:id", zodRequestValidator({ params: MeetingDetailsIdParamSchema }), deleteMeetingDetails);

export default router;
