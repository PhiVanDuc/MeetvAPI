const express = require("express");
const { serve } = require("inngest/express");
const inngest = require("../libs/inngest/client");
const functions = require("../libs/inngest/functions");

const router = express.Router();

const authRoute = require("../modules/auth/auth.route");
const oauthRoute = require("../modules/oauth/oauth.route");
const agentRoute = require("../modules/agents/agent.route");
const streamRoute = require("../modules/stream/stream.route");
const meetingRoute = require("../modules/meetings/meeting.route");
const authenticateMiddleware = require("../middlewares/authenticate.middleware");

router.use("/auth", authRoute);
router.use("/oauth", oauthRoute);
router.use("/stream", streamRoute);
router.use("/inngest", serve({ client: inngest, functions }));

router.use("/agents", authenticateMiddleware, agentRoute);
router.use("/meetings", authenticateMiddleware, meetingRoute);

module.exports = router;