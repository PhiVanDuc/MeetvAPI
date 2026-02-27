const express = require("express");
const router = express.Router();

const authController = require("../auth/auth.controller");

router.post("/otp", authController.sendOTP);
router.post("/users/accounts", authController.signUp);
router.post("/sessions", authController.signIn);
router.patch("/passwords", authController.resetPassword);

module.exports = router;