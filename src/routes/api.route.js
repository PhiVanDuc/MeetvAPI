const express = require("express");
const router = express.Router();

const authenticateMiddleware = require("../middlewares/authenticate.middleware");

const authRoute = require("../modules/auth/auth.route");
const oauthRoute = require("../modules/oauth/oauth.route");
const agentRoute = require("../modules/agents/agent.route");
const meetingRoute = require("../modules/meetings/meeting.route");

router.use("/auth", authRoute);
router.use("/oauth", oauthRoute);

router.use("/agents", authenticateMiddleware, agentRoute);
router.use("/meetings", authenticateMiddleware, meetingRoute);

module.exports = router;