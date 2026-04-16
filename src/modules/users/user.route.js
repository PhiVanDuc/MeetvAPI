const express = require("express");
const userController = require("./user.controller");

const router = express.Router();

router.get("/profile", userController.profile);

module.exports = router;