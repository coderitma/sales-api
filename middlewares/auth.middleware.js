const jwt = require("jsonwebtoken");

const config = process.env;

const verifyToken = (req, res, next) => {
  const token =
    req.body.token || req.query.token || req.headers["x-access-token"];

  if (!token) {
    return res.status(403).json({
      message: "A token is required for authentication",
    });
  }

  try {
    const decodedToken = jwt.verify(token, config.TOKEN_KEY);
    req.user = decodedToken;
    console.log(decodedToken);
  } catch (error) {
    return res.status(401).json({
      message: "Invalid token",
    });
  }

  return next();
};

module.exports = verifyToken;
