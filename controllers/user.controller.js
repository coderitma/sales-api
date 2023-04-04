var express = require("express");
var jwt = require("jsonwebtoken");
const ModelUser = require("../models/user.model");
const { responseError, setResponseError } = require("../utils/helpers");
var router = express.Router();

router.post("/check-token", async (req, res) => {});

router.post("/login", async (req, res) => {
  try {
    let user = await ModelUser.checkPasswordAndGetUser(req);
    let token = jwt.sign({ email: user.email }, process.env.TOKEN_KEY, {
      expiresIn: "10h",
    });

    return res.status(200).json({ token });
  } catch (error) {
    return responseError(res, error);
  }
});

router.post("/register", async (req, res) => {
  try {
    let user = await ModelUser.get(req);
    if (user)
      throw setResponseError(STATUS_CODE_400, "User has been registered.");

    return res.status(201).json(await ModelUser.create(req));
  } catch (error) {
    return responseError(res, error);
  }
});

module.exports = router;
