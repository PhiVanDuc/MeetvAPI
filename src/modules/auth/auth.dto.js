const z = require("zod");

module.exports = {
    signUpRequest: z.object({
        name: z
            .string()
            .trim()
            .min(1, { error: "Tên người dùng đang trống." })
            .max(30, { error: "Tên người dùng tối đa 30 ký tự." }),
        email: z
            .email({ error: "Email không đúng định dạng." }),
        otp: z
            .string()
            .trim()
            .length(6, { error: "Mã OTP cần đúng 6 ký tự." })
            .regex(/^\d+$/, { error: "Mã OTP chỉ được chứa số." }),
        password: z
            .string()
            .trim()
            .min(8, { error: "Mật khẩu tối thiểu 8 ký tự." })
            .max(64, { error: "Mật khẩu tối đa 64 ký tự." }),
        passwordConfirmation: z
            .string()
            .trim()
            .min(8, { error: "Mật khẩu xác nhận tối thiểu 8 ký tự." })
            .max(64, { error: "Mật khẩu xác nhận tối đa 64 ký tự." })
    })
        .refine(data => data.password === data.passwordConfirmation, {
            path: ["passwordConfirmation"],
            message: "Mật khẩu xác nhận không khớp."
        }),

    signInRequest: z.object({
        email: z
            .email({ error: "Email không đúng định dạng." }),
        password: z
            .string()
            .trim()
            .min(8, { error: "Mật khẩu tối thiểu 8 ký tự." })
            .max(64, { error: "Mật khẩu tối đa 64 ký tự." })
    }),

    signInResponse: z.object({
        accessToken: z
            .uuidv4({ error: "Phiên đăng nhập không hợp lệ." }),
        refreshToken: z
            .uuidv4({ error: "Phiên đăng nhập không hợp lệ." })
    }),
}