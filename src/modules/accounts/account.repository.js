const { User, Account } = require("../../db/models/index");
const baseRepository = require("../base/base.repository")(Account);

module.exports = {
    ...baseRepository
}