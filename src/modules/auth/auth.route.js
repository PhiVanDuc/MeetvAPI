const express = require("express");
const router = express.Router();

const authController = require("../auth/auth.controller");

router.post("/otp", authController.sendOTP);
router.post("/users", authController.signUp);
router.post("/session", authController.signIn);
router.patch("/password/recovery", authController.forgotPassword);
router.post("/session/refresh", authController.refreshTokens);

module.exports = router;