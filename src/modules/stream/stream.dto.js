const { z } = require("zod");

module.exports = {
    generateTokenResponse: z.object({
        token: z
            .string({ error: "Token người dùng của dịch vụ stream cần phải là chuỗi." })
            .min(1, { error: "Token người dùng của dịch vụ stream không thể để trống." })
    })
}