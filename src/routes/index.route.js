const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
    res.send(`<p>Chào mừng đến với máy chủ.</p>`);
});

module.exports = router;