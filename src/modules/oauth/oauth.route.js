const express = require("express");
const { google } = require("../../libs/passport");
const oauthController = require("./oauth.controller");

const router = express.Router();

router.get("/google", google);
router.post("/google/session", oauthController.googleSignIn);
router.get("/google/callback", oauthController.googleCallback);

module.exports = router;