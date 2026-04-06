const streamService = require("./stream.service");

module.exports = {
    generateToken: async (req, res, next) => {
        try {
            const responseData = await streamService.generateToken({ userId: req.user.id });

            return res.status(200).json({
                message: "",
                data: responseData
            });
        }
        catch(error) { next(error); }
    },

    webhook: async (req, res, next) => {
        try {
            await streamService.webhook({
                signature: req.get("x-signature"),
                apiKey: req.get("x-api-key"),
                body: req.rawBody
            });
            
            return res.status(200).json({ message: "Tiếp nhận sự kiện thành công!" });
        }
        catch(error) { next(error); }
    },

    deleteUsers: async (req, res, next) => {
        try {
            await streamService.deleteUsers();
            return res.status(200).json({ message: `Xoá các người dùng stream thành công.` });
        }
        catch(error) { next(error); }
    },

    deleteCalls: async (req, res, next) => {
        try {
            await streamService.deleteCalls();
            return res.status(200).json({ message: `Xoá các cuộc gọi stream thành công.` });
        }
        catch(error) { next(error); }
    }
}