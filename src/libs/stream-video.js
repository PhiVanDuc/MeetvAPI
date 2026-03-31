const { StreamClient } = require("@stream-io/node-sdk");

module.exports = new StreamClient(
    process.env.STREAM_VIDEO_API_KEY,
    process.env.STREAM_VIDEO_SECRET_KEY
);