const { verifyJWT } = require("../libs/jwt");
const throwHTTPError = require("../utils/throw-http-error");

module.exports = (req, res, next) => {
    try {
        const accessToken = req.headers.authorization?.split(' ')[1];
        const payload = verifyJWT(accessToken);

        if (payload?.isExpire || payload?.isInvalid) {
            const error = payload.isExpire 
                ? { code: "session-expired", message: "Phiên đăng nhập đã hết hạn." }
                : { code: "session-invalid", message: "Phiên đăng nhập không hợp lệ." };
                
            throwHTTPError({
                status: 401,
                errors: [error],
                message: error.message
            });
        }

        const { iat, exp, ...user } = payload;
        req.user = user;
        
        next();
    }
    catch(error) { next(error); }
}