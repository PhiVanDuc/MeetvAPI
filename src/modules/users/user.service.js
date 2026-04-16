const { User, Account, Subcription } = require("../../db/models/index");

const userDTO = require("./user.dto");
const throwHTTPError = require("../../utils/throw-http-error");

module.exports = {
    profile: async (data) => {
        const profile = await User.findByPk(
            data.userId,
            {
                include: [
                    {
                        model: Account,
                        as: "accounts",
                        where: { id: data.accountId }
                    },
                    {
                        model: Subcription,
                        as: "subcription"
                    }
                ]
            }
        )

        if (!profile) throwHTTPError({ status: 404, message: "Người dùng không tồn tại." });
        const { subcription, accounts, ...user } = profile.get({ plain: true });

        return userDTO.getProfileResponse.parse({
            ...user,
            account: accounts[0],
            ...(subcription ? { subcription } : {})
        });
    }
}