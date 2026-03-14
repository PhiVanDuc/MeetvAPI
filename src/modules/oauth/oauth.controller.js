const { ZodError } = require("zod");

const oauthDTO = require("./oauth.dto");
const oauthService = require("./oauth.service");
const { passport } = require("../../libs/passport");

const FE = process.env.FE;

module.exports = {
    googleCallback: (req, res, next) => {
        const REDIRECT_URL = "/oauth/google";

        const redirectError = (message) => (
            res.redirect(`${FE}${REDIRECT_URL}?errorMessage=${encodeURIComponent(message || "Đăng nhập bằng nền tảng Google thất bại.")}`)
        )

        passport.authenticate(
            "google",
            async (error, user, info, status) => {
                try {
                    if (error || !user) {
                        if (error) console.error(error);
                        if (!user) console.error({ info, status });
                        return redirectError(error.message);
                    }

                    const responseData = await oauthService.googleCallback(user);
                    return res.redirect(`${FE}${REDIRECT_URL}?code=${responseData.code}`);
                }
                catch(error) {
                    console.error(error);

                    let errorMessage = error.message;
                    if (error instanceof ZodError) errorMessage = error.issues[0].message;

                    return redirectError(errorMessage);
                }
            }
        )(req, res, next);
    },

    googleSignIn: async (req, res, next) => {
        try {
            const body = req.body;
            const data = oauthDTO.oauthSignInRequest.parse(body);

            const responseData = await oauthService.googleSignIn(data);

            return res.status(200).json({
                message: "Đăng nhập thành công.",
                data: responseData
            });
        }
        catch(error) { next(error); }
    }
}