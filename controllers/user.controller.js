var express = require("express");
var bcrypt = require("bcryptjs");
var jwt = require("jsonwebtoken");
const ModelUser = require("../models/user.model");
var router = express.Router();

router.post("/check-token", async (req, res) => {});

router.post("/login", async (req, res) => {
  try {
    let { email, password } = req.body;

    let user = await ModelUser.userExist(email);
    if (!user) {
      return res.status(400).json({ message: "User belum registrasi" });
    }

    let passwordIsValid = await bcrypt.compare(password, user.password);
    if (!passwordIsValid) {
      return res.status(400).json({ message: "Password salah" });
    }

    let token = jwt.sign({ email }, process.env.TOKEN_KEY, {
      expiresIn: "10h",
    });

    return res.status(200).json({ token });
  } catch (error) {
    console.error(error);
    return res.status(400).json({ message: "Bad Request" });
  }
});

router.post("/register", async (req, res) => {
  try {
    let firstName = req.body.firstName;
    let lastName = req.body.lastName;
    let email = req.body.email;
    let password = req.body.password;

    let user = await ModelUser.userExist(email);
    if (user) {
      return res.status(400).json({ message: "Email telah terdaftar" });
    }

    let result = await ModelUser.create(firstName, lastName, email, password);
    return res.status(201).json(result);
  } catch (error) {
    console.error(error);
    return res.status(400).json({ message: "Bad Request" });
  }
});

module.exports = router;
