const z = require("zod");

module.exports = {
    googleCallbackResponse: z.object({
        exchangeToken: z
            .string()
            .trim()
            .regex(/^[A-Za-z0-9_-]{43}$/, "Sai định dạng.")
    }),

    oauthSignInRequest: z.object({
        exchangeToken: z
            .string()
            .trim()
            .regex(/^[A-Za-z0-9_-]{43}$/, "Sai định dạng.")
    }),

    oauthSignInResponse: z.object({
        accessToken: z
            .jwt({ error: "Sai định dạng." }),
        refreshToken: z
            .jwt({ error: "Sai định dạng." })
    })
}