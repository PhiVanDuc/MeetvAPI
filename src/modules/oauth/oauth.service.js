const { Op } = require("sequelize");
const { User, Account, Code, Subscription, sequelize } = require("../../db/models/index");

const oauthDTO = require("./oauth.dto");
const { signJWT } = require("../../libs/jwt");
const hashCode = require("../../utils/hash-code");
const generateCode = require("../../utils/generate-code");
const generateExpiry = require("../../utils/generate-expiry");
const throwHTTPError = require("../../utils/throw-http-error");

const PROVIDERS = require("../../consts/providers");
const CODE_TYPES = require("../../consts/code-types");

module.exports = {
    googleCallback: async (data) => {
        const transaction = await sequelize.transaction();
        const { id: providerId, provider, _json: { name, email, email_verified: emailVerified } } = data;

        try {
            if (email && !emailVerified) throw new Error("Email của tài khoản nền tảng Google chưa được xác minh.");

            let user, userId;
            let account = await Account.findOne({
                where: { providerId, provider },
                transaction
            });

            if (account) userId = account.userId;
            else {
                if (email) {
                    user = await User.findOne({
                        where: { email },
                        transaction
                    });
                }

                if (!user) {
                    user = await User.create(
                        { name, email },
                        { transaction }
                    );

                    await Subscription.create(
                        {
                            userId: user.id,
                            servicePriceId: "free",
                            serviceSubscriptionId: "free"
                        },
                        { transaction }
                    );
                }

                await Account.create(
                    {
                        provider,
                        providerId,
                        userId: user.id
                    },
                    { transaction }
                );

                userId = user.id;
            }

            await Code.destroy({
                where: {
                    identifier: userId,
                    type: CODE_TYPES.EXCHANGE_SESSION
                },
                transaction
            });

            const code = generateCode();

            await Code.create(
                {
                    identifier: userId,
                    code: hashCode(code),
                    type: CODE_TYPES.EXCHANGE_SESSION,
                    expiresAt: generateExpiry({ minutes: 2 }),
                },
                { transaction }
            );

            await transaction.commit();
            return oauthDTO.googleCallbackResponse.parse({ code });

        } catch (error) {
            if (!transaction.finished) await transaction.rollback();
            throw error;
        }
    },

    googleSignIn: async (data) => {
        const transaction = await sequelize.transaction();

        try {
            const code = await Code.findOne({
                where: {
                    code: hashCode(data.code),
                    expiresAt: { [Op.gt]: new Date() },
                    type: CODE_TYPES.EXCHANGE_SESSION
                },
                transaction
            });

            if (!code) throwHTTPError({ status: 400, message: "Mã trao đổi không tồn tại hoặc đã hết hạn." });

            const user = await User.findByPk(
                code.identifier,
                { transaction }
            );

            const account = await Account.findOne({
                where: {
                    userId: user.id,
                    provider: PROVIDERS.GOOGLE
                },
                transaction
            });

            await Code.destroy({
                where: {
                    identifier: user.id,
                    type: CODE_TYPES.EXCHANGE_SESSION
                },
                transaction
            });

            await transaction.commit();

            const accessToken = signJWT({
                payload: {
                    id: user.id,
                    accountId: account.id
                },
                expiresIn: "10m"
            });

            const refreshToken = signJWT({
                payload: {
                    id: user.id,
                    accountId: account.id
                },
                expiresIn: "14d"
            });

            return oauthDTO.oauthSignInResponse.parse({ accessToken, refreshToken });
        }
        catch(error) {
            if (!transaction.finished) await transaction.rollback();
            throw error;
        }
    }
}