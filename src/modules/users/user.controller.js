const userService = require("./user.service");

module.exports = {
    profile: async (req, res, next) => {
        try {
            const responseData = await userService.profile({
                userId: req.user.id,
                accountId: req.user.accountId
            });

            return res.status(200).json({
                message: "Lấy ra hồ sơ người dùng thành công.",
                data: responseData
            })
        }
        catch(error) { next(error); }
    }
}