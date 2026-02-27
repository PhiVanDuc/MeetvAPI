const crypto = require("crypto");
module.exports = () => crypto.randomBytes(32).toString("base64url");