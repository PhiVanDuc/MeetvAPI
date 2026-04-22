const express = require("express");

const meetingController = require("./meeting.controller");
const authenticateMiddleware = require("../../middlewares/authenticate.middleware");

const router = express.Router();

router.delete("/stream/users", meetingController.deleteStreamUsers);
router.delete("/stream/calls", meetingController.deleteStreamCalls);
router.post("/stream/webhook", meetingController.triggerStreamWebhook);

router.use(authenticateMiddleware);

router.get("/", meetingController.getMeetings);
router.post("/", meetingController.addMeeting);
router.get("/:id", meetingController.getMeeting);
router.put("/:id", meetingController.updateMeeting);
router.delete("/:id", meetingController.deleteMeeting);
router.post("/stream/token", meetingController.generateStreamToken);
router.get("/:id/transcript", meetingController.getMeetingTranscript);

module.exports = router;