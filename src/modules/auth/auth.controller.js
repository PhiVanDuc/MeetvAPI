const authDTO = require("./auth.dto");
const authService = require("./auth.service");
const { passport } = require("../../configs/passport");

const FE = process.env.FE;

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
    },

    googleCallback: (req, res, next) => {
        passport.authenticate(
            "google",
            async (error, user, info, status) => {
                try {
                    if (error || !user) {
                        if (error) console.error(error);
                        if (!user) console.error({ info, status });
                        return res.redirect(`${FE}/sign-in?error=google_auth_failed`);
                    }

                    const exchangeToken = await authService.googleCallback(user);
                    return res.redirect(`${FE}/oauth/google?exchangeToken=${exchangeToken}`);
                }
                catch(error) {
                    console.error(error);
                    return res.redirect(`${FE}/sign-in?error=google_auth_failed`);
                }
            }
        )(req, res, next)
    },

    oauthSignIn: async (req, res, next) => {
        try {
            const body = req.body;
            const data = authDTO.oauthSignInRequest.parse(body);

            const responseData = await authService.oauthSignIn(data);

            return res.status(200).json({
                message: "Đăng nhập thành công.",
                data: responseData
            });
        }
        catch(error) { next(error); }
    },
}