const { ZodError } = require("zod");

module.exports = (error, req, res, next) => {
    let errors;
    const data = error.data;
    let status = error.status || 500;
    let message = error.message || "Lỗi server nội bộ!";

    if (error instanceof ZodError) {
        status = 400;
        message = "Lỗi định dạng dữ liệu!";

        errors = error.issues.map(error => ({
            code: error.code,
            field: error.path[0],
            message: error.message
        }))
    }

    console.error(error);

    return res.status(status).json({
        message,
        ...(data ? { data } : {}),
        ...(errors ? { errors }: {})
    });
};