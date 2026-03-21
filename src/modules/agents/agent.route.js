const express = require("express");
const router = express.Router();

const agentController = require("./agent.controller");

router.get("/", agentController.getAgents);
router.get("/:id", agentController.getAgent);
router.post("/", agentController.addAgent);
router.put("/:id", agentController.updateAgent);
router.delete("/:id", agentController.deleteAgent);

module.exports = router;