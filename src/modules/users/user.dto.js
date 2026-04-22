const { z } = require("zod");

const PROVIDERS = require("../../consts/providers");

module.exports = {
    getProfileResponse: z.object({
        id: z
            .uuidv4("Id người dùng sai định dạng."),
        serviceCustomerId: z
            .string({ error: "Id khách hàng cần phải là chuỗi" })
            .nullable()
            .optional(),
        name: z
            .string({ error: "Tên người dùng cần phải là chuỗi." }),
        email: z
            .email({ error: "Email sai định dạng." }),
        account: z.object({
            id: z
                .uuidv4({ error: "Id tài khoản sai định dạng." }),
            provider: z
                .enum(Object.values(PROVIDERS), { error: "Loại xác thực không hợp lệ." }),
        }),
        subscription: z.object({
            id: z
                .uuidv4({ error: "Id gói đăng ký sai định dạng." }),
            serviceSubscriptionId: z
                .string({ error: "Id gói đăng ký bên dịch vụ cần phải là chuỗi" }),
            servicePriceId: z
                .string({ error: "Id giá bên dịch vụ cần phải là chuỗi" }),
            currentPeriodStart: z
                .date({ error: "Chu kỳ bắt đầu gói đăng ký cần phải là đối tượng thời gian." })
                .nullable()
                .optional(),
            currentPeriodEnd: z
                .date({ error: "Chu kỳ kết thúc gói đăng ký cần phải là đối tượng thời gian." })
                .nullable()
                .optional(),
        })
        .nullable()
        .optional()
    })
}