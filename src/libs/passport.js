const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: "http://localhost:3001/api/oauth/google/callback"
        },
        (accessToken, refreshToken, profile, cb) => {
            return cb(null, profile);
        }
    )
);

const google = passport.authenticate(
    "google",
    {
        scope: ["profile", "email"],
        prompt: "select_account"
    }
);

module.exports = {
    passport,
    google
};