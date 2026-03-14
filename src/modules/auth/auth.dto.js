const z = require("zod");

const CODE_TYPES = require("../../consts/code-types");

module.exports = {
    sendOTPRequest: z.object({
        email: z
            .email({ error: "Email sai định dạng." }),
        type: z
            .enum(
                Object.values(CODE_TYPES),
                { error: "Loại mã OTP sai định dạng." }
            )
    }),

    signUpRequest: z.object({
        name: z
            .string()
            .trim()
            .min(1, { error: "Tên người dùng không thể để trống." })
            .max(100, { error: "Tên người dùng không thể vượt quá 100 ký tự." }),
        email: z
            .email({ error: "Email sai định dạng." }),
        otp: z
            .string()
            .trim()
            .regex(/^\d{6}$/, { error: "Mã OTP sai định dạng." }),
        password: z
            .string()
            .trim()
            .min(8, { error: "Mật khẩu không thể ít hơn 8 ký tự." })
            .max(100, { error: "Mật khẩu không thể vượt quá 100 ký tự." })
    }),

    signInRequest: z.object({
        email: z
            .email({ error: "Email sai định dạng." }),
        password: z
            .string()
            .trim()
            .min(1, { error: "Mật khẩu không thể để trống." })
            .max(100, { error: "Mật khẩu không thể vượt quá 100 ký tự." }),
    }),

    signInResponse: z.object({
        accessToken: z
            .jwt({ error: "Access token sai định dạng." }),
        refreshToken: z
            .jwt({ error: "Refresh token sai định dạng." })
    }),

    forgotPasswordRequest: z.object({
        email: z
            .email({ error: "Email sai định dạng." }),
        otp: z
            .string()
            .trim()
            .regex(/^\d{6}$/, { error: "Mã OTP sai định dạng." }),
        password: z
            .string()
            .trim()
            .min(8, { error: "Mật khẩu không thể ít hơn 8 ký tự." })
            .max(100, { error: "Mật khẩu không thể vượt quá 100 ký tự." })
    }),

    refreshTokensRequest: z.object({
        refreshToken: z
            .jwt({ error: "Refresh token sai định dạng." })
    }),

    refreshTokensResponse: z.object({
        accessToken: z
            .jwt({ error: "Access token sai định dạng." }),
        refreshToken: z
            .jwt({ error: "Refresh token sai định dạng." })
    })
}