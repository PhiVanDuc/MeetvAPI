const z = require("zod");

module.exports = {
    googleCallbackResponse: z.object({
        code: z
            .string()
            .trim()
            .regex(/^[a-f0-9]{64}$/, { error: "Mã trao đổi không hợp lệ." })
    }),

    oauthSignInRequest: z.object({
        code: z
            .string()
            .trim()
            .regex(/^[a-f0-9]{64}$/, { error: "Mã trao đổi không hợp lệ." })
    }),

    oauthSignInResponse: z.object({
        accessToken: z
            .jwt({ error: "Access token sai định dạng." }),
        refreshToken: z
            .jwt({ error: "Refresh token sai định dạng." })
    })
}