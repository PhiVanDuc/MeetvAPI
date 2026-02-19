const { OAuth2Client: GoogleOAuth2Client } = require('google-auth-library');

const googleClient = new GoogleOAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    'postmessage'
);

module.exports = {
    googleClient
}