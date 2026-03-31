const { Op } = require("sequelize");
const { User, Account, Code, sequelize } = require("../../db/models/index");

const authDTO = require("./auth.dto");
const hashCode = require("../../utils/hash-code");
const sendEmail = require("../../libs/email/send-email");
const { signJWT, verifyJWT } = require("../../libs/jwt");
const generateCode = require("../../utils/generate-code");
const hashPassword = require("../../utils/hash-password");
const generateExpiry = require("../../utils/generate-expiry");
const throwHTTPError = require("../../utils/throw-http-error");
const comparePassword = require("../../utils/compare-password");

const PROVIDERS = require("../../consts/providers");
const CODE_TYPES = require("../../consts/code-types");
const EMAIL_TEMPLATES = require("../../consts/email-templates");

module.exports = {
    sendOTP: async (data) => {  
        const transaction = await sequelize.transaction();

        try {
            await Code.destroy({
                where: {
                    type: data.type,
                    identifier: data.email
                },
                transaction
            });

            const otp = generateCode("otp");

            await Code.create(
                {
                    type: data.type,
                    code: hashCode(otp),
                    identifier: data.email,
                    expiresAt: generateExpiry({ minutes: 2 })
                },
                { transaction }
            );

            await transaction.commit();

            await sendEmail({
                data: { otp },
                to: data.email,
                template: EMAIL_TEMPLATES.OTP
            });
        }
        catch (error) {
            if (!transaction.finished) await transaction.rollback();
            throw error;
        }
    },

    signUp: async (data) => {
        const transaction = await sequelize.transaction();

        try {
            const otp = await Code.findOne({
                where: {
                    identifier: data.email,
                    type: CODE_TYPES.SIGN_UP,
                    code: hashCode(data.otp),
                    expiresAt: { [Op.gt]: new Date() }
                },
                transaction
            });

            if (!otp) throwHTTPError({ status: 400, message: "Mã OTP không tồn tại hoặc đã hết hạn." });

            let user = await User.findOne({
                where: { email: otp.identifier },
                transaction
            });

            if (user) {
                const account = await Account.findOne({
                    where: {
                        userId: user.id,
                        provider: PROVIDERS.CREDENTIALS
                    },
                    transaction
                });

                if (account) throwHTTPError({ status: 409, message: "Đã tồn tại tài khoản thuộc email hiện tại." });
            }
            else {
                user = await User.create(
                    {
                        name: data.name,
                        email: data.email,
                    },
                    { transaction }
                );
            }

            await Account.create(
                {
                    userId: user.id,
                    providerId: user.email,
                    provider: PROVIDERS.CREDENTIALS,
                    password: await hashPassword({ password: data.password })
                },
                { transaction }
            )

            await Code.destroy({
                where: {
                    identifier: user.email,
                    type: CODE_TYPES.SIGN_UP
                },
                transaction
            });

            await transaction.commit();
        }
        catch (error) {
            if (!transaction.finished) await transaction.rollback();
            throw error;
        }
    },

    signIn: async (data) => {
        const user = await User.findOne({
            where: { email: data.email }
        });

        if (!user) throwHTTPError({ status: 401, message: "Email hoặc mật khẩu không chính xác." });

        const account = await Account.findOne({
            where: {
                userId: user.id,
                provider: PROVIDERS.CREDENTIALS
            }
        });

        if (!account) throwHTTPError({ status: 401, message: "Email hoặc mật khẩu không chính xác." });

        const isValidPassword = await comparePassword({
            password: data.password,
            hashedPassword: account.password
        });

        if (!isValidPassword) throwHTTPError({ status: 401, message: "Email hoặc mật khẩu không chính xác." });

        const accessToken = signJWT({
            payload: {
                id: user.id,
                name: user.name,
                email: user.email,
                accountId: account.id,
                provider: account.provider
            },
            expiresIn: "2s"
        });

        const refreshToken = signJWT({
            payload: {
                id: user.id,
                accountId: account.id
            },
            expiresIn: "14d"
        });

        return authDTO.signInResponse.parse({ accessToken, refreshToken });
    },

    forgotPassword: async (data) => {
        const transaction = await sequelize.transaction();

        try {
            const user = await User.findOne({
                where: { email: data.email },
                transaction
            });

            if (!user) throwHTTPError({ status: 400, message: "Không có tài khoản nào thuộc email hiện tại." });

            const account = await Account.findOne({
                where: {
                    userId: user.id,
                    provider: PROVIDERS.CREDENTIALS
                },
                transaction
            });

            if (!account) throwHTTPError({ status: 400, message: "Không có tài khoản nào thuộc email hiện tại." });

            const otp = await Code.findOne({
                where: {
                    identifier: user.email,
                    code: hashCode(data.otp),
                    type: CODE_TYPES.FORGOT_PASSWORD,
                    expiresAt: { [Op.gt]: new Date() }
                },
                transaction
            });

            if (!otp) throwHTTPError({ status: 400, message: "Mã OTP không tồn tại hoặc đã hết hạn." });

            await account.update(
                { password: await hashPassword({ password: data.password }) },
                { transaction }
            );

            await Code.destroy({
                where: {
                    identifier: user.email,
                    type: CODE_TYPES.FORGOT_PASSWORD
                },
                transaction
            });

            await transaction.commit();
        }
        catch(error) {
            if (!transaction.finished) await transaction.rollback();
            throw error;
        }
    },

    refreshSession: async (data) => {
        const payload = verifyJWT(data.refreshToken);

        if (payload?.isExpire) throwHTTPError({ status: 401, message: "Phiên đăng nhập đã hết hạn." });
        if (payload?.isInvalid) throwHTTPError({ status: 401, message: "Phiên đăng nhập không hợp lệ." });

        const user = await User.findByPk(payload.id);
        const account = await Account.findByPk(payload.accountId);
        
        if (!user || !account) throwHTTPError({ status: 401, message: "Tài khoản không tồn tại." });

        const accessToken = signJWT({
            payload: {
                id: user.id,
                name: user.name,
                email: user.email,
                accountId: account.id,
                provider: account.provider
            },
            expiresIn: "2s"
        });

        const refreshToken = signJWT({
            payload: {
                id: user.id,
                accountId: account.id
            },
            expiresIn: "14d"
        });

        return authDTO.refreshSessionResponse.parse({ accessToken, refreshToken });
    }
}