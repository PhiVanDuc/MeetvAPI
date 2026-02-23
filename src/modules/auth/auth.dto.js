const z = require("zod");

const VERIFY_ACTIONS = require("../../consts/verify-action");

module.exports = {
    sendOTPRequest: z.object({
        email: z
            .email({ error: "Sai định dạng." }),
        action: z
            .enum(
                Object.values(VERIFY_ACTIONS),
                { error: "Sai định dạng." }
            )
    }),

    signUpRequest: z.object({
        name: z
            .string()
            .trim()
            .min(1, { error: "Không thể để trống." })
            .max(100, { error: "Không thể vượt quá 100 ký tự." }),
        email: z
            .email({ error: "Sai định dạng." }),
        otp: z
            .string()
            .trim()
            .regex(
                /^\d{6}$/,
                { error: "Sai định dạng." }
            ),
        password: z
            .string()
            .trim()
            .min(8, { error: "Quá ngắn." })
            .max(100, { error: "Quá dài." }),
        passwordConfirmation: z
            .string()
            .trim()
            .min(1, { error: "Không thể để trống." })
    })
        .refine((data) => data.password === data.passwordConfirmation, {
            error: "Không khớp",
            path: ["passwordConfirmation"],
        }),

    signInRequest: z.object({
        email: z
            .email({ error: "Sai định dạng." }),
        password: z
            .string()
            .trim()
            .min(1, { error: "Không thể để trống." })
            .max(100, { error: "Quá dài." }),
    }),

    signInResponse: z.object({
        accessToken: z
            .jwt({ error: "Sai định dạng." }),
        refreshToken: z
            .jwt({ error: "Sai định dạng." })
    }),

    resetPasswordRequest: z.object({
        email: z
            .email({ error: "Sai định dạng." }),
        otp: z
            .string()
            .trim()
            .regex(
                /^\d{6}$/,
                { error: "Sai định dạng." }
            ),
        password: z
            .string()
            .trim()
            .min(8, { error: "Quá ngắn." })
            .max(100, { error: "Quá dài." }),
        passwordConfirmation: z
            .string()
            .trim()
            .min(1, { error: "Không thể để trống." })
    })
        .refine((data) => data.password === data.passwordConfirmation, {
            error: "Không khớp",
            path: ["passwordConfirmation"],
        }),

    oauthSignInRequest: z.object({
        exchangeToken: z
            .string()
            .trim()
            .length(12, { error: "Sai định dạng." })
    }),

    oauthSignInResponse: z.object({
        accessToken: z
            .jwt({ error: "Sai định dạng." }),
        refreshToken: z
            .jwt({ error: "Sai định dạng." })
    })
}