const crypto = require("crypto");

module.exports = (type) => {
    if (type === "otp") {
        let otp = "";

        for (let i = 0; i < 6; i++) otp += crypto.randomInt(0, 10);
        return otp;
    }
    else return crypto.randomBytes(32).toString("hex");
}