const express = require("express");
const router = express.Router();

const { google } = require("../../configs/passport");
const oauthController = require("./oauth.controller");

router.get("/google", google);
router.get("/google/callback", oauthController.googleCallback);
router.post("/google/sessions", oauthController.googleSignIn);

module.exports = router;