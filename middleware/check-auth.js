const jwt = require("jsonwebtoken");
const HttpError = require("../models/http-error");

module.exports = (req, res, next) => {
  // console.log(req.method, "METHOD");
  if (req.method === "OPTIONS") {
    return next();
  }
  try {
    const token = req.headers.authorization.split(" ")[1]; //encode the token in the header "Bearer Token"
    if (!token) {
      throw new Error("Authorization failed!");
    } 

    const decodedToken = jwt.verify(token,"supersecret_dont_share")
    req.userData = { userId: decodedToken.userId }
    next();
  } catch (err) {
    const error = new HttpError(
      "Authentication failed", 401
    );
    return next(error);
  }
};