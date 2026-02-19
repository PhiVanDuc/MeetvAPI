module.exports = (req, res, next) => {
    console.error(`Không tìm thấy đường dẫn -- ${req.method} ${req.originalUrl}`);

    res.status(404).json({
        status: 404,
        message: "Không tìm thấy đường dẫn!"
    });
};;