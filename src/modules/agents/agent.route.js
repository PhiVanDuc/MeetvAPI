const express = require("express");
const router = express.Router();

const agentController = require("./agent.controller");

router.get("/", agentController.getAgents);
router.post("/", agentController.addAgent);

module.exports = router;