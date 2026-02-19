require("dotenv").config();

const http = require("http");

const express = require("express");
const morgan = require('morgan');
const corsMiddleware = require('cors');

const corsConfig = require('./src/configs/cors');

const errorMiddleware = require("./src/middlewares/error.middleware");
const notFoundMiddleware = require("./src/middlewares/not-found.middleware");

const indexRoute = require("./src/routes/index.route");

const app = express();
const server = http.createServer(app);

// Cors
app.use(corsMiddleware(corsConfig));

// Parse Data Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Debug Logger Middleware
app.use(morgan('dev'));

// APIs
app.use("/", indexRoute);

// Global Error Middleware
app.use(notFoundMiddleware);
app.use(errorMiddleware);

server.listen(process.env.PORT, () => console.log(`Server đang chạy trên port ${process.env.PORT}`));