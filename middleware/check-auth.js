const jwt = require("jsonwebtoken");
const HttpError = require("../models/http-error");
require('dotenv').config();
const JWT_KEY = process.env.JWT_KEY;

module.exports = (req, res, next) => {
  if (req.method === "OPTIONS") {
    return next();
  }
  
  try {
    const token = req.headers.authorization.split(" ")[1]; //encode the token in the header "Bearer Token"
    if (!token) {
      throw new Error("Authorization failed!");
    } 

    const decodedToken = jwt.verify(token, JWT_KEY)
    req.userData = { userId: decodedToken.userId }
    next();
  } catch (err) {
    const error = new HttpError(
      "Authentication failed", 403 //forbidden
    );
    return next(error);
  }
};