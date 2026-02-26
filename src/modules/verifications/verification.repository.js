const { Verification } = require("../../db/models/index");
const baseRepository = require("../base/base.repository")(Verification);

module.exports = {
    ...baseRepository
}