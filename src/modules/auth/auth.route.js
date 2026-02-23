const express = require("express");
const router = express.Router();

const authController = require("../auth/auth.controller");
const { passportGoogleMiddleware } = require("../../configs/passport");

router.post("/otp", authController.sendOTP);
router.post("/users/accounts", authController.signUp);
router.post("/sessions", authController.signIn);
router.patch("/passwords", authController.resetPassword);

router.get("/google", passportGoogleMiddleware);
router.get("/google/callback", authController.googleCallback);
router.post("/oauth/sessions", authController.oauthSignIn);

module.exports = router;