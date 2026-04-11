const cors = require("cors");

const whitelist = [process.env.FE];

module.exports = cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);

        if (whitelist.indexOf(origin) !== -1) callback(null, true);
        else callback(new Error('Không cho phép bởi cors!'));
    },
    allowedHeaders: "*",
    optionsSuccessStatus: 200,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"]
});