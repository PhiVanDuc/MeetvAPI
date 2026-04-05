const express = require("express");
const router = express.Router();

const streamVideoController = require("./stream.controller");
const authenticateMiddleware = require("../../middlewares/authenticate.middleware");

router.post("/webhook", streamVideoController.webhook);
router.post("/token", authenticateMiddleware, streamVideoController.generateToken);

module.exports = router;