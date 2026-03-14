const bcrypt = require("bcrypt");

module.exports = async ({ password, salt = 10 }) => {
    if (!password) return;

    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
};