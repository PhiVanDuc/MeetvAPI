const { User, Account } = require("../../db/models/index");
const baseRepository = require("../base/base.repository")(Account);

module.exports = {
    ...baseRepository,

    findAccountWithUserById: async ({ id, options = {} }) => {
        return await baseRepository.findById({
            id,
            options: {
                include: {
                    model: User,
                    as: "user"
                },
                ...options
            }
        });
    }
}