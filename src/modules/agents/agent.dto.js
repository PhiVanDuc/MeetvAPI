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
            .catch(20),
        name: z
            .string({ error: "Tên agent cần phải là chuỗi." })
            .optional()
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
        createdAgent: z
            .boolean({ error: "Người dùng đã tạo agent hay chưa cần phải là boolean." }),
        agents: z
            .array(
                z.object({
                    id: z
                        .uuid({ error: "Id agent không hợp lệ." }),
                    name: z
                        .string({ error: "Tên agent cần phải là chuỗi." }),
                    instructions: z
                        .string({ error: "Chỉ dẫn agent cần phải là chuỗi." })
                })
            )
    }),

    getAgentRequest: z.object({
        id: z
            .uuidv4({ error: "Id agent không hợp lệ." })
    }),

    getAgentResponse: z.object({
        id: z
            .uuid({ error: "Id agent không hợp lệ." }),
        name: z
            .string({ error: "Tên agent cần phải là chuỗi." }),
        instructions: z
            .string({ error: "Chỉ dẫn agent cần phải là chuỗi." })
    }),

    addAgentRequest: z.object({
        name: z
            .string({ error: "Tên agent cần phải là chuỗi." })
            .trim()
            .min(1, { error: "Tên agent không thể để trống." }),
        instructions: z
            .string({ error: "Chỉ dẫn agent cần phải là chuỗi." })
            .trim()
            .min(1, { error: "Chỉ dẫn agent không thể để trống." })
    }),

    updateAgentRequest: z.object({
        id: z
            .uuidv4({ error: "Id agent không hợp lệ." }),
        name: z
            .string({ error: "Tên agent cần phải là chuỗi." })
            .trim()
            .min(1, { error: "Tên agent không thể để trống." }),
        instructions: z
            .string({ error: "Chỉ dẫn agent cần phải là chuỗi." })
            .trim()
            .min(1, { error: "Chỉ dẫn agent không thể để trống." })
    }),

    deleteAgentRequest: z.object({
        id: z
            .uuidv4({ error: "Id agent không hợp lệ." })
    })
}