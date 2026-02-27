const express = require("express");
const router = express.Router();

const authRoute = require("../modules/auth/auth.route");
const oauthRoute = require("../modules/oauth/oauth.route");

router.use("/auth", authRoute);
router.use("/oauth", oauthRoute);

module.exports = router;