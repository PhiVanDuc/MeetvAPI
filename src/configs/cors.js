const whitelist = [
    process.env.FE
];

const corsOptions = {
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);

        if (whitelist.indexOf(origin) !== -1) callback(null, true);
        else callback(new Error('Không cho phép bởi cors!'));
    },
    methods: "GET,POST,PUT,PATCH,DELETE",
    optionsSuccessStatus: 200,
};

module.exports = corsOptions;