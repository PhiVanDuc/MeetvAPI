const express = require("express");
const streamController = require("./stream.controller");
const authenticateMiddleware = require("../../middlewares/authenticate.middleware");

const router = express.Router();

router.post("/webhook", streamController.webhook);
router.delete("/users", streamController.deleteUsers);
router.delete("/calls", streamController.deleteCalls);
router.post("/token", authenticateMiddleware, streamController.generateToken);

module.exports = router;