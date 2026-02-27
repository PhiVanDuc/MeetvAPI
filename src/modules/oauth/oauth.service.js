const { sequelize } = require("../../db/models/index");
const userRepository = require("../users/user.repository");
const accountRepository = require("../accounts/account.repository");
const verificationRepository = require("../verifications/verification.repository");

const oauthDTO = require("./oauth.dto");
const { signJWT } = require("../../libs/jwt");
const generateExpiry = require("../../utils/generate-expiry");
const throwHTTPError = require("../../utils/throw-http-error");
const generateRandomString = require("../../utils/generate-random-string");

const PROVIDERS = require("../../consts/providers");
const VERIFICATION_ACTIONS = require("../../consts/verification-actions");

module.exports = {
    googleCallback: async (data) => {
        const transaction = await sequelize.transaction();

        try {
            const profile = data._json;
            if (!profile.email_verified) throwHTTPError({ status: 401, message: "Email của tài khoản Google chưa được xác minh." });

            let account;
            let user = await userRepository.find({
                where: { email: profile.email },
                transaction
            });

            if (!user) {
                user = await userRepository.add({
                    data: {
                        name: profile.name,
                        email: profile.email,
                        image: profile.picture
                    },
                    options: { transaction }
                });
            }

            account = await accountRepository.find({
                where: {
                    userId: user.id,
                    providerId: profile.sub,
                    provider: PROVIDERS.GOOGLE
                },
                transaction
            });

            if (!account) {
                account = await accountRepository.add({
                    data: {
                        userId: user.id,
                        providerId: profile.sub,
                        provider: PROVIDERS.GOOGLE
                    },
                    options: { transaction }
                });
            }

            const exchangeToken = generateRandomString();

            await verificationRepository.destroy({
                where: { identifier: account.id },
                transaction
            });

            await verificationRepository.add({
                data: {
                    identifier: account.id,
                    value: exchangeToken,
                    expiresAt: generateExpiry({ time: 2 }),
                    action: VERIFICATION_ACTIONS.SIGN_IN_GOOGLE
                },
                options: { transaction }
            });

            await transaction.commit();
            return oauthDTO.googleCallbackResponse.parse({ exchangeToken });
        }
        catch(error) {
            await transaction.rollback();
            throw error;
        }
    },

    googleSignIn: async (data) => {
        const transaction = await sequelize.transaction();

        try {
            const exchangeToken = await verificationRepository.find({
                where: { value: data.exchangeToken },
                transaction
            });

            if (!exchangeToken) throwHTTPError({ status: 401, message: "Token xác thực không hợp lệ." });
            if (new Date() > new Date(exchangeToken.expiresAt)) throwHTTPError({ status: 401, message: "Token xác thực đã hết hạn." });

            const account = await accountRepository.findAccountWithUserById({
                id: exchangeToken.identifier,
                options: { transaction }
            });

            const accessToken = signJWT({
                expiresIn: "10m",
                payload: {
                    id: account.user.id,
                    name: account.user.name,
                    email: account.user.email,
                    image: account.user.image,
                    accountId: account.id,
                    provider: account.provider
                }
            });

            const refreshToken = signJWT({
                expiresIn: "30d",
                payload: {
                    id: account.user.id,
                    accountId: account.id
                }
            });

            await verificationRepository.destroy({
                where: { identifier: exchangeToken.identifier },
                transaction
            });

            await transaction.commit();
            return oauthDTO.oauthSignInResponse.parse({ accessToken, refreshToken });
        }
        catch (error) {
            await transaction.rollback();
            throw error;
        }
    }
}