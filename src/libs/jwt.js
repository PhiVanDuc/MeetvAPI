const jsonwebtoken = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

const signJWT = ({ payload, expiresIn }) => jsonwebtoken.sign(payload, JWT_SECRET, { expiresIn });

const verifyJWT = (jwtToken) => {
    try { return jsonwebtoken.verify(jwtToken, JWT_SECRET); }
    catch (error) {
        if (error.name === "TokenExpiredError") {
            return {
                isExpired: true,
                isInvalid: false
            }
        }

        return {
            isExpired: false,
            isInvalid: true
        }
    }
}

module.exports = { signJWT, verifyJWT };