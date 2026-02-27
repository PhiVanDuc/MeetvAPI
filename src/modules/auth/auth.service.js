const { sequelize } = require("../../db/models/index");
const userRepository = require("../users/user.repository");
const accountRepository = require("../accounts/account.repository");
const verificationRepository = require("../verifications/verification.repository");

const bcrypt = require("bcrypt");
const authDTO = require("./auth.dto");
const { signJWT } = require("../../libs/jwt");
const hashOTP = require("../../utils/hash-otp");
const generateOTP = require("../../utils/generate-otp");
const sendEmail = require("../../libs/email/send-email");
const generateExpiry = require("../../utils/generate-expiry");
const throwHTTPError = require("../../utils/throw-http-error");

const SALT = 10;
const PROVIDERS = require("../../consts/providers");
const EMAIL_TEMPLATES = require("../../consts/email-templates");
const VERIFICATION_ACTIONS = require("../../consts/verification-actions");

module.exports = {
    sendOTP: async (data) => {
        const otp = generateOTP();
        const transaction = await sequelize.transaction();

        try {
            await verificationRepository.destroy({
                where: { identifier: data.email },
                transaction
            });

            await verificationRepository.add({
                data: {
                    value: hashOTP(otp),
                    action: data.action,
                    identifier: data.email,
                    expiresAt: generateExpiry({ time: 5 })
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
                where: {
                    identifier: data.email,
                    value: hashOTP(data.otp),
                    action: VERIFICATION_ACTIONS.SIGN_UP
                },
                transaction
            });

            if (!otp) throwHTTPError({ status: 400, message: "Mã OTP không hợp lệ." });
            if (new Date() > otp.expiresAt) throwHTTPError({ status: 400, message: "Mã OTP đã hết hạn." });

            const user = await userRepository.find({
                where: { email: data.email },
                transaction
            });

            if (user) {
                const account = await accountRepository.find({
                    where: {
                        userId: user.id,
                        provider: PROVIDERS.CREDENTIALS
                    },
                    transaction
                });

                userId = user.id;
                if (account) throwHTTPError({ status: 409, message: "Một tài khoản đã được đăng ký với email hiện tại." });
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
                    password: await bcrypt.hash(data.password, SALT)
                },
                options: { transaction }
            });

            await verificationRepository.destroy({
                where: { identifier: data.email },
                transaction
            });

            await transaction.commit();
        }
        catch(error) {
            await transaction.rollback();
            throw error;
        }
    },

    resetPassword: async (data) => {
        const transaction = await sequelize.transaction();

        try {
            const otp = await verificationRepository.find({
                where: {
                    identifier: data.email,
                    value: hashOTP(data.otp),
                    action: VERIFICATION_ACTIONS.RESET_PASSWORD
                },
                transaction
            });

            if (!otp) throwHTTPError({ status: 400, message: "Mã OTP không hợp lệ." });
            if (new Date() > otp.expiresAt) throwHTTPError({ status: 400, message: "Mã OTP đã hết hạn." });

            const user = await userRepository.find({
                where: { email: data.email },
                transaction
            });

            if (!user) throwHTTPError({ status: 409, message: "Không có tài khoản nào được đăng ký với email hiện tại." });

            const account = await accountRepository.find({
                where: {
                    userId: user.id,
                    provider: PROVIDERS.CREDENTIALS
                },
                transaction
            });

            const hashedPassword = await bcrypt.hash(data.password, SALT);

            if (!account) {
                await accountRepository.add({
                    data: {
                        userId: user.id,
                        providerId: user.id,
                        password: hashedPassword,
                        provider: PROVIDERS.CREDENTIALS
                    },
                    options: { transaction }
                });
            }
            else {
                await accountRepository.update({
                    data: { password: hashedPassword },
                    options: {
                        where: { id: account.id },
                        transaction
                    }
                });
            }

            await verificationRepository.destroy({
                where: { identifier: data.email },
                transaction
            });

            await transaction.commit();
        }
        catch (error) {
            await transaction.rollback();
            throw error;
        }
    },

    signIn: async (data) => {
        const user = await userRepository.find({
            where: { email: data.email }
        });

        if (!user) throwHTTPError({ status: 401, message: "Email hoặc mật khẩu không tồn tại." });

        const account = await accountRepository.find({
            where: {
                userId: user.id,
                provider: PROVIDERS.CREDENTIALS
            }
        });

        if (!account) throwHTTPError({ status: 401, message: "Email hoặc mật khẩu không tồn tại." });
        if (!await bcrypt.compare(data.password, account.password)) throwHTTPError({ status: 401, message: "Email hoặc mật khẩu không tồn tại." });

        const accessToken = signJWT({
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

        const refreshToken = signJWT({
            expiresIn: "30d",
            payload: {
                id: user.id,
                accountId: account.id
            }
        });

        return authDTO.signInResponse.parse({ accessToken, refreshToken });
    },
}