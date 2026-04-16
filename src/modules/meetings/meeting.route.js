const express = require("express");
const meetingController = require("./meeting.controller");

const router = express.Router();

router.get("/", meetingController.getMeetings);
router.post("/", meetingController.addMeeting);
router.get("/:id", meetingController.getMeeting);
router.put("/:id", meetingController.updateMeeting);
router.delete("/:id", meetingController.deleteMeeting);
router.get("/:id/transcript", meetingController.getMeetingTranscript);

module.exports = router;