const bcrypt = require('bcrypt');

module.exports = async ({ password, hashedPassword }) => {
    return await bcrypt.compare(password, hashedPassword);
}