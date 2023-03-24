var express = require("express");
var bcrypt = require("bcryptjs");
var jwt = require("jsonwebtoken");
var UserModel = require("../models/user.model");
var router = express.Router();

router.post("/check-token", async (req, res) => {});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!(email && password)) {
      return res.status(400).json({
        message: "All input is required",
      });
    }

    // Validate jika user ada di database
    const user = await UserModel.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      // Create token
      const token = jwt.sign(
        { user_id: user._id, email },
        process.env.TOKEN_KEY,
        { expiresIn: "2h" }
      );

      user.token = token;
      return res.status(200).json({ token });
    }

    return res.status(400).json({
      message: "Invalid credentials",
    });
  } catch (error) {
    console.error(error);
  }
});

router.post("/register", async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    if (!(email && password && firstName && lastName)) {
      return res.status(400).json({
        message: "All input is required",
      });
    }

    // check jika user sudah ada
    // validasi jika user sudah tersedia di dalam database
    const oldUser = await UserModel.findOne({ email });

    if (oldUser) {
      return res.status(401).json({
        message: "User already exist. Please login",
      });
    }

    // encryption user password
    const enkripPassword = await bcrypt.hash(password, 10);

    const user = await UserModel.create({
      firstName,
      lastName,
      email: email.toLowerCase(),
      password: enkripPassword,
    });

    // Membuat token
    const token = jwt.sign({ userId: user._id, email }, process.env.TOKEN_KEY, {
      expiresIn: "2h",
    });

    // save user token
    user.token = token;

    // return new user
    res.status(201).json(user);
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
