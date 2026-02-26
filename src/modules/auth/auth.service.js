const userRepository = require("../users/user.repository");
const { User, Account, sequelize } = require("../../db/models/index");
const accountRepository = require("../accounts/account.repository");
const verificationRepository = require("../verifications/verification.repository");

const crypto = require("crypto");
const bcrypt = require("bcrypt");
const authDTO = require("./auth.dto");
const { signJwt } = require("../../libs/jwt");
const sendEmail = require("../../libs/email/send-email");
const throwHttpError = require("../../utils/throw-http-error");

const PROVIDERS = require("../../consts/providers");
const EMAIL_TEMPLATES = require("../../consts/email-templates");
const VERIFICATION_ACTIONS = require("../../consts/verification-actions");

module.exports = {
    sendOTP: async (data) => {
        const transaction = await sequelize.transaction();
        const otp = crypto.randomInt(100000, 1000000).toString();

        try {
            await verificationRepository.destroy({
                transaction,
                where: { identifier: data.email }
            });

            await verificationRepository.add({
                data: {
                    action: data.action,
                    identifier: data.email,
                    expiresAt: new Date(Date.now() + 5 * 60 * 1000),
                    value: crypto.createHash('sha256').update(otp).digest('hex')
                },
                options: { transaction }
            });

            await transaction.commit();

            await sendEmail({
                data: { otp },
                emailTo: data.email,
                emailTemplate: EMAIL_TEMPLATES.OTP
            });
        }
        catch(error) {
            await transaction.rollback();
            throw error;
        }
    },

    signUp: async (data) => {   
        let userId;     
        const transaction = await sequelize.transaction();

        try {
            const otp = await verificationRepository.find({
                transaction,
                where: {
                    identifier: data.email,
                    action: VERIFICATION_ACTIONS.SIGN_UP,
                    value: crypto.createHash('sha256').update(data.otp).digest('hex')
                }
            });

            if (!otp) throwHttpError({ status: 400, message: "Mã OTP không hợp lệ." });
            if (new Date() > otp.expiresAt) throwHttpError({ status: 400, message: "Mã OTP đã hết hạn." });

            const user = await userRepository.find({
                transaction,
                where: { email: data.email }
            });

            if (user) {
                const account = await accountRepository.find({
                    transaction,
                    where: {
                        userId: user.id,
                        providerId: user.id,
                        provider: PROVIDERS.CREDENTIALS
                    }
                });

                userId = user.id;
                if (account) throwHttpError({ status: 409, message: "Một tài khoản đã được đăng ký với email hiện tại." });
            }

            if (!user) {
                const newUser = await userRepository.add({
                    data: {
                        name: data.name,
                        email: data.email
                    },
                    options: { transaction }
                });

                userId = newUser.id;
            }

            await accountRepository.add({
                data: {
                    userId,
                    providerId: userId,
                    provider: PROVIDERS.CREDENTIALS,
                    password: await bcrypt.hash(data.password, 10)
                },
                options: { transaction }
            });

            await verificationRepository.destroy({
                transaction,
                where: { identifier: data.email }
            });

            await transaction.commit();
        }
        catch(error) {
            await transaction.rollback();
            throw error;
        }
    },

    signIn: async (data) => {
        const user = await userRepository.find({
            where: { email: data.email }
        });

        if (!user) throwHttpError({ status: 401, message: "Email hoặc mật khẩu không tồn tại." });

        const account = await accountRepository.find({
            where: {
                userId: user.id,
                providerId: user.id,
                provider: PROVIDERS.CREDENTIALS
            }
        });

        if (!account) throwHttpError({ status: 401, message: "Email hoặc mật khẩu không tồn tại." });
        if (!await bcrypt.compare(data.password, account.password)) throwHttpError({ status: 401, message: "Email hoặc mật khẩu không tồn tại." });

        const accessToken = signJwt({
            expiresIn: "10m",
            payload: {
                id: user.id,
                name: user.name,
                email: user.email,
                image: user.image,
                accountId: account.id,
                provider: account.provider
            }
        });

        const refreshToken = signJwt({
            expiresIn: "30d",
            payload: {
                id: user.id,
                accountId: account.id
            }
        });

        return authDTO.signInResponse.parse({ accessToken, refreshToken });
    },

    resetPassword: async (data) => {
        const transaction = await sequelize.transaction();

        try {
            const otp = await verificationRepository.find({
                transaction,
                where: {
                    identifier: data.email,
                    action: VERIFICATION_ACTIONS.RESET_PASSWORD,
                    value: crypto.createHash('sha256').update(data.otp).digest('hex')
                }
            });

            if (!otp) throwHttpError({ status: 400, message: "Mã OTP không hợp lệ." });
            if (new Date() > otp.expiresAt) throwHttpError({ status: 400, message: "Mã OTP đã hết hạn." });

            const user = await userRepository.find({
                transaction,
                where: { email: data.email }
            });

            if (!user) throwHttpError({ status: 409, message: "Không có tài khoản nào được đăng ký với email hiện tại." });

            const account = await accountRepository.find({
                transaction,
                where: {
                    userId: user.id,
                    providerId: user.id,
                    provider: PROVIDERS.CREDENTIALS
                }
            });

            const hashedPassword = await bcrypt.hash(data.password, 10);

            if (!account) {
                await accountRepository.add({
                    options: { transaction },
                    data: {
                        userId: user.id,
                        providerId: user.id,
                        password: hashedPassword,
                        provider: PROVIDERS.CREDENTIALS
                    }
                });
            }
            else {
                await accountRepository.update({
                    data: { password: hashedPassword },
                    options: {
                        transaction,
                        where: { id: account.id }
                    }
                });
            }

            await verificationRepository.destroy({
                transaction,
                where: { identifier: data.email }
            });

            await transaction.commit();
        }
        catch (error) {
            await transaction.rollback();
            throw error;
        }
    },

    googleCallback: async (data) => {
        let user;
        const transaction = await sequelize.transaction();
        const exchangeToken = crypto.randomBytes(32).toString('hex');

        try {
            if (!data._json.email_verified) throwHttpError({ status: 401, message: "Email của tài khoản Google chưa được xác minh." });

            const account = await accountRepository.find({
                transaction,
                where: {
                    providerId: data.id,
                    provider: PROVIDERS.GOOGLE
                },
                include: {
                    as: "user",
                    model: User
                }
            });

            if (account) user = account.user;
            else {
                user = await userRepository.find({
                    transaction,
                    where: { email: data._json.email }
                });

                if (!user) {
                    user = await userRepository.add({
                        options: { transaction },
                        data: {
                            name: data._json.name,
                            email: data._json.email,
                            image: data._json.picture
                        }
                    });
                }

                await accountRepository.add({
                    options: { transaction },
                    data: {
                        userId: user.id,
                        providerId: data.id,
                        provider: PROVIDERS.GOOGLE
                    }
                });
            }

            await verificationRepository.destroy({
                transaction,
                where: { identifier: user.id }
            });

            await verificationRepository.add({
                options: { transaction },
                data: {
                    identifier: user.id,
                    value: exchangeToken,
                    action: VERIFICATION_ACTIONS.SIGN_IN_GOOGLE,
                    expiresAt: new Date(Date.now() + 2 * 60 * 1000)
                }
            });

            await transaction.commit();
            return authDTO.googleCallbackResponse.parse(exchangeToken);
        }
        catch(error) {
            await transaction.rollback();
            throw error;
        }
    },

    oauthSignIn: async (data) => {
        const transaction = await sequelize.transaction();

        try {
            const exchangeToken = await verificationRepository.find({
                transaction,
                where: {
                    value: data.exchangeToken,
                    action: VERIFICATION_ACTIONS.SIGN_IN_GOOGLE
                }
            });

            if (exchangeToken) throwHttpError({ status: 401, message: "Token xác thực không hợp lệ." });
            if (new Date() > exchangeToken.expiresAt) throwHttpError({ status: 401, message: "Token xác thực đã hết hạn." });

            const user = await userRepository.find({
                transaction,
                where: { id: exchangeToken.identifier },
                include: {
                    as: "accounts",
                    model: Account,
                    where: { provider: PROVIDERS.GOOGLE }
                }
            });

            const accessToken = signJwt({
                expiresIn: "10m",
                payload: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    image: user.image,
                    accountId: user.accounts[0].id,
                    provider: user.accounts[0].provider
                }
            });

            const refreshToken = signJwt({
                expiresIn: "30d",
                payload: {
                    id: user.id,
                    accountId: user.accounts[0].id
                }
            });

            await transaction.commit();
            return authDTO.oauthSignInResponse.parse({ accessToken, refreshToken });
        }
        catch(error) {
            await transaction.rollback();
            throw error;
        }
    }
}