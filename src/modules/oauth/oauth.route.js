const express = require("express");
const router = express.Router();

const { google } = require("../../libs/passport");
const oauthController = require("./oauth.controller");

router.get("/google", google);
router.get("/google/callback", oauthController.googleCallback);
router.post("/google/session", oauthController.googleSignIn);

module.exports = router;