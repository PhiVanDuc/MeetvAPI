const crypto = require("crypto");

module.exports = (code) => {
    if (!code) return;
    return crypto.createHash("sha256").update(code).digest("hex");
}