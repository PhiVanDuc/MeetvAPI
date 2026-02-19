const express = require("express");
const router = express.Router();

router.get("/", (req, res) => { res.send(`<p>Welcome to Server</p>`) });

module.exports = router;