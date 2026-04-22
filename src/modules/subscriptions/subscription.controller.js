const subscriptionService = require("./subscription.service");

module.exports = {
    getUsage: async (req, res, next) => {
        try {
            const responseData = await subscriptionService.getUsage({ userId: req.user.id });

            return res.status(200).json({
                message: "Thành công lấy ra dữ liệu sử dụng.",
                data: responseData
            });
        }
        catch(error) { next(error); }
    }
}