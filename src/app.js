const express = require("express");
const logger = require("morgan");
const cors = require("cors");
const { errorHandler } = require("./helpers/apiHelpers");

const cryptoRouter = require("./routes/api/cryptoRouter");

const app = express();

const formatsLogger = app.get("env") === "development" ? "dev" : "short";

app.use(logger(formatsLogger));
app.use(cors());
app.use(express.json());

app.use("/api/crypto", cryptoRouter);

app.use(errorHandler);

module.exports = app;