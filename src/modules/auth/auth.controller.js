const authDTO = require("./auth.dto");
const authService = require("./auth.service");

module.exports = {
    sendOTP: async (req, res, next) => {
        try {
            const body = req.body;
            const data = authDTO.sendOTPRequest.parse(body);

            await authService.sendOTP(data);

            return res.status(200).json({
                message: "Gửi mã OTP thành công."
            });
        }
        catch(error) { next(error); }
    },

    signUp: async (req, res, next) => {
        try {
            const body = req.body;
            const data = authDTO.signUpRequest.parse(body);

            await authService.signUp(data);

            return res.status(201).json({
                message: "Đăng ký tài khoản thành công."
            });
        }
        catch(error) { next(error); }
    },

    signIn: async (req, res, next) => {
        try {
            const body = req.body;
            const data = authDTO.signInRequest.parse(body);

            const responseData = await authService.signIn(data);

            return res.status(200).json({
                message: "Đăng nhập thành công.",
                data: responseData
            });
        }
        catch(error) { next(error); }
    },

    resetPassword: async (req, res, next) => {
        try {
            const body = req.body;
            const data = authDTO.resetPasswordRequest.parse(body);

            await authService.resetPassword(data);

            return res.status(200).json({
                message: "Đặt lại mật khẩu thành công."
            });
        }
        catch(error) { next(error); }
    }
}