const express = require("express");
const agentController = require("./agent.controller");

const router = express.Router();

router.get("/", agentController.getAgents);
router.post("/", agentController.addAgent);
router.get("/:id", agentController.getAgent);
router.put("/:id", agentController.updateAgent);
router.delete("/:id", agentController.deleteAgent);

module.exports = router;