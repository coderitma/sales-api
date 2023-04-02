var express = require("express");
const http = require("http");
const application = require("./application");
const server = http.createServer(application);

const { PORT } = process.env;
const port = process.env.PORT || PORT || 4001;

application.use("/reports", express.static("reports"));

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
