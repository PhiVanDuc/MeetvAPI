const express = require("express");
const router = express.Router();

const streamController = require("./stream.controller");
const authenticateMiddleware = require("../../middlewares/authenticate.middleware");

router.post("/webhook", streamController.webhook);
router.post("/token", authenticateMiddleware, streamController.generateToken);

router.delete("/users", streamController.deleteUsers);
router.delete("/calls", streamController.deleteCalls);

module.exports = router;