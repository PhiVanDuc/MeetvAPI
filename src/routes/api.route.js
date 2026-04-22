const express = require("express");
const { serve } = require("inngest/express");
const inngest = require("../libs/inngest/client");
const functions = require("../libs/inngest/functions");
const authRoute = require("../modules/auth/auth.route");
const userRoute = require("../modules/users/user.route");
const oauthRoute = require("../modules/oauth/oauth.route");
const agentRoute = require("../modules/agents/agent.route");
const meetingRoute = require("../modules/meetings/meeting.route");
const subscriptionRoute = require("../modules/subscriptions/subscription.route");
const authenticateMiddleware = require("../middlewares/authenticate.middleware");

const router = express.Router();

router.use("/auth", authRoute);
router.use("/oauth", oauthRoute);
router.use("/meetings", meetingRoute);
router.use("/inngest", serve({ client: inngest, functions }));

router.use(authenticateMiddleware);

router.use("/users", userRoute);
router.use("/agents", agentRoute);
router.use("/subscriptions", subscriptionRoute);

module.exports = router;