const { z } = require("zod");

module.exports = {
    getAgentsRequest: z.object({
        page: z
            .coerce
            .number()
            .int()
            .min(1)
            .catch(1),
        limit: z
            .coerce
            .number()
            .int()
            .min(20)
            .max(100)
            .catch(20)
    }),

    getAgentsResponse: z.object({
        pagination: z.object({
            page: z
                .number()
                .int()
                .min(1)
                .catch(1),
            limit: z
                .number()
                .int()
                .min(20)
                .max(100)
                .catch(20)
                .transform(value => value.toString()),
            totalPages: z
                .number()
                .int()
                .min(1)
                .catch(1)
                .transform(value => value.toString())
        }),
        agents: z
            .array(
                z.object({
                    id: z
                        .uuid({ error: "Id agent không hợp lệ." }),
                    name: z
                        .string({ error: "Tên agent cần phải là chuỗi." }),
                    slug: z
                        .string({ error: "Slug agent cần phải là chuỗi." }),
                    instructions: z
                        .string({ error: "Chỉ dẫn agent cần phải là chuỗi." })
                })
            )
    }),

    addAgentRequest: z.object({
        userId: z
            .uuidv4({ error: "Id người dùng không hợp lệ." }),
        name: z
            .string({ error: "Tên agent cần phải là chuỗi." })
            .trim()
            .min(1, { error: "Tên agent không thể để trống." })
            .max(100, { error: "Tên agent không thể vượt quá 100 ký tự." }),
        instructions: z
            .string({ error: "Chỉ dẫn agent cần phải là chuỗi." })
            .trim()
            .min(1, { error: "Chỉ dẫn agent không thể để trống." })
            .max(2000, { error: "Chỉ dẫn agent không thể vượt quá 2000 ký tự." })
    })
}