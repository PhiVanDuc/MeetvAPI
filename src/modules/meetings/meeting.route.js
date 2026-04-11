const express = require("express");
const router = express.Router();

const meetingController = require("./meeting.controller");

router.get("/", meetingController.getMeetings);
router.get("/:id", meetingController.getMeeting);
router.post("/", meetingController.addMeeting);
router.put("/:id", meetingController.updateMeeting);
router.delete("/:id", meetingController.deleteMeeting);
router.get("/:id/transcript", meetingController.getMeetingTranscript);

module.exports = router;