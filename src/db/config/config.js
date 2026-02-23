require("dotenv").config();

module.exports = {
    "development": {
        "use_env_variable": "DB_URL",
        "dialect": "postgres",
        "dialectOptions": {
            "ssl": {
                "require": true,
                "rejectUnauthorized": false
            },
            "quoteIdentifiers": false,
            "keepAlive": true
        },
        "pool": {
            "max": 5,
            "min": 0,
            "acquire": 30000,
            "idle": 10000
        }
    }
}

// "development": {
//     "username": process.env.DB_USERNAME,
//     "password": process.env.DB_PASSWORD,
//     "database": process.env.DB_DATABASE,
//     "host": process.env.DB_HOST,
//     "dialect": process.env.DB_DIALECT
// },
// "test": {
//     "username": "root",
//     "password": null,
//     "database": "database_test",
//     "host": "127.0.0.1",
//     "dialect": "postgres"
// },
// "production": {
//     "username": "root",
//     "password": null,
//     "database": "database_production",
//     "host": "127.0.0.1",
//     "dialect": "postgres"
// }