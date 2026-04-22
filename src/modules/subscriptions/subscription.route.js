const express = require("express");
const subscriptionController = require("./subscription.controller");

const router = express.Router();

router.get("/usage", subscriptionController.getUsage);

module.exports = router;