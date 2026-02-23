const { OTP } = require("../../db/models/index");
const baseRepository = require("../base/base.repository")(OTP);

module.exports = {
    ...baseRepository,

    destroyOTPByEmail: async ({ email, options }) => {
        await OTP.destroy({
            where: { email },
            ...options
        })
    }
}