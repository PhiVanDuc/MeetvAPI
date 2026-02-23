const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: "http://localhost:3001/api/auth/google/callback"
        },
        (accessToken, refreshToken, profile, cb) => {
            console.log(profile);
            return cb(null, {});
        }
    )
);

const passportGoogleMiddleware = passport.authenticate(
    "google",
    {
        scope: ["profile", "email"],
        prompt: "select_account"
    }
);

module.exports = {
    passport,
    passportGoogleMiddleware
};