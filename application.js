require("dotenv").config();

const cors = require("cors");
const express = require("express");
const application = express();

// application.use(cors());
// application.options("*", cors());

application.use(express.json());
application.use("/users", require("./controllers/user.controller"));
application.use("/hello", require("./controllers/hello.controller"));
application.use("/barang", require("./controllers/barang.controller"));
application.use("/pemasok", require("./controllers/pemasok.controller"));
application.use("/pembelian", require("./controllers/pembelian.controller"));

module.exports = application;
