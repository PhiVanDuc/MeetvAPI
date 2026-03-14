const hashCode = require("./hash-code");

module.exports = ({ code, hashedCode }) => {
    if (!code || !hashedCode) return false;
    return hashCode(code) === hashedCode;
}