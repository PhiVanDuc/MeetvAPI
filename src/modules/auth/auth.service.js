const { sequelize } = require("../../db/models/index");
const otpRepository = require("../otps/otp.repository");
const userRepository = require("../users/user.repository");
const accountRepository = require("../accounts/account.repository");

const crypto = require("crypto");
const bcrypt = require("bcrypt");
const authDto = require("./auth.dto");
const { signJwt } = require("../../libs/jwt");
const sendEmail = require("../../libs/email/send-email");
const throwHttpError = require("../../utils/throw-http-error");

module.exports = {
    sendOTP: async (data) => {},

    signUp: async (data) => {},

    signIn: async (data) => {},

    resetPassword: async (data) => {},

    googleCallback: async (data) => {},

    oauthSignIn: async (data) => {}
}