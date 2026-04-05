const streamVideoService = require("./stream.service");

module.exports = {
    generateToken: async (req, res, next) => {
        try {
            const responseData = await streamVideoService.generateToken({ userId: req.user.id });

            return res.status(200).json({
                message: "",
                data: responseData
            });
        }
        catch(error) { next(error); }
    },

    webhook: async (req, res, next) => {
        try {
            await streamVideoService.webhook({
                signature: req.get("x-signature"),
                apiKey: req.get("x-api-key"),
                body: req.rawBody
            });
            
            return res.status(200).json({ message: "Tiếp nhận sự kiện thành công!" });
        }
        catch(error) { next(error); }
    }
}