const express = require("express");
const authController = require("../auth/auth.controller");

const router = express.Router();

router.post("/otp", authController.sendOTP);
router.post("/users", authController.signUp);
router.post("/session", authController.signIn);
router.post("/session/refresh", authController.refreshSession);
router.patch("/password/recovery", authController.forgotPassword);

module.exports = router;