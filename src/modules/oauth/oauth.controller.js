const oauthDTO = require("./oauth.dto");
const oauthService = require("./oauth.service");
const { passport } = require("../../configs/passport");

const FE = process.env.FE;

module.exports = {
    googleCallback: (req, res, next) => {
        passport.authenticate(
            "google",
            async (error, user, info, status) => {
                try {
                    if (error || !user) {
                        if (error) console.error(error);
                        if (!user) console.error({ info, status });
                        return res.redirect(`${FE}/sign-in?error=google-auth-failed`);
                    }

                    const responseData = await oauthService.googleCallback(user);
                    return res.redirect(`${FE}/oauth/google/callback?exchangeToken=${responseData.exchangeToken}`);
                }
                catch(error) {
                    console.error(error);
                    return res.redirect(`${FE}/sign-in?error=google-auth-failed`);
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