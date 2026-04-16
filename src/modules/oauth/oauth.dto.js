const z = require("zod");

module.exports = {
    googleCallbackResponse: z.object({
        code: z
            .string({ error: "Mã trao đổi cần phải là chuỗi." })
            .trim()
            .regex(/^[a-f0-9]{64}$/, { error: "Mã trao đổi sai định dạng." })
    }),

    oauthSignInRequest: z.object({
        code: z
            .string({ error: "Mã trao đổi cần phải là chuỗi." })
            .trim()
            .regex(/^[a-f0-9]{64}$/, { error: "Mã trao đổi sai định dạng." })
    }),

    oauthSignInResponse: z.object({
        accessToken: z
            .jwt({ error: "Access token sai định dạng." }),
        refreshToken: z
            .jwt({ error: "Refresh token sai định dạng." })
    })
}