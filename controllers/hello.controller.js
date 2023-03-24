var express = require("express");
var router = express.Router();
var authentication = require("../middlewares/auth.middleware");

router.post("/world", [authentication], (req, res) => {
  res.status(200).send("Welcome 🙌 ");
});

module.exports = router;
