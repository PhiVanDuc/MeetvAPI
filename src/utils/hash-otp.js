const crypto = require("crypto");
module.exports = (otp) => crypto.createHash('sha256').update(otp).digest('hex');