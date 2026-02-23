const { User } = require("../../db/models/index");
const baseRepository = require("../base/base.repository")(User);

module.exports = {
    ...baseRepository
}