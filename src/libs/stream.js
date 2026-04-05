const { StreamClient } = require("@stream-io/node-sdk");

module.exports = new StreamClient(
    process.env.STREAM_API_KEY,
    process.env.STREAM_API_SECRET
);