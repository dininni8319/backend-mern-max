const HttpError = require('../models/http-error');
const { validationResult } = require('express-validator');
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
// const { encryptFun } = require("../utils/bcrypt");
const User = require("../models/user");
require('dotenv').config();
const JWT_KEY = process.env.JWT_KEY;

exports.getUserList = async (req, res, next) => {

  let users;
  try {
    users = await User.find({}, "-password") // exclude the password
  } catch (err) {
    const error = new HttpError(
      "Fetching user failed, try again later.",
      500
    );

    return next(error);
  }
  res.status(200).json(users.map(user => user.toObject({getters: true })));
};

exports.signup = async (req, res, next) => {
  const error = validationResult(req);

  if (!error.isEmpty()) {

    const error = new HttpError("Invalid data input, please check your data.", 422);
    return next(error); // use next instead of throw in an async task
  };

  const { name, email, password } = req.body;
  
  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError(
      "Signing up failed, please try it later",
      500
    );

    return next(error)
  }

  if (existingUser) {
    const error = new HttpError(
      'User exists already, please login instead', 
      422
    );
    return next(error);
  }

  let hashPassword;
  try {
    // const hash = encryptFun(10, password);
    hashPassword = await bcrypt.hash(password, 12);
  } catch (err) {
    const error = new HttpError(
      "Could not create a user, please try again.",
      500
    );
    return next(error);
  }
  const newUser = new User({
    name,
    email,
    image: req.file.path,
    password: hashPassword,
    places: []
  });

  try {
    await newUser.save();
  } catch (err) {
    const error = new HttpError(
      "Signing Up user failed, please try it again.",
      500
    );
    return next(error);
  }
  if (!newUser.name) {
    const error = new HttpError('User was not created.', 404);
    return next(error); 
  }
  
  let token;
  try {
    console.log(newUser, 'TESTINGNEW');
    token = jwt.sign(
      { userId: newUser.id, email: newUser.email }, 
      JWT_KEY, 
     { expiresIn: "1h" }
    );
  } catch (err) {
    const error = new HttpError(
      "Signing Up user failed, please try it again.",
      500
    );
    return next(error);
  }

  res.status(201).json({
    id: newUser.id,
    user: newUser.name,
    email: newUser.email,
    token: token
  });

  };

exports.signin = async (req, res, next) => {
  const { email, password } = req.body;

  let emailExists = await User.findOne({email: email});

  const validatePassword = (hash) => {
    let data = bcrypt
      .compare(password, hash)
      .then(data => {
        return data;
      })
    return data;
  };
  let isValidPassword = await validatePassword(emailExists.password);
  
  if (emailExists && isValidPassword) {
    token = jwt.sign(
      { userId: emailExists.id, email: emailExists.email }, 
      JWT_KEY, 
      { expiresIn: "1h" }
    );

    let response = { 
      message: "Correct credentials", 
      user: emailExists.name,
      id: emailExists.id,
      email: emailExists.email,
      token: token,
    }

    return res.status(200).json(response); 
  } else {
    const error = new HttpError('The credential are not correct.', 500);
    return next(error);
  }
};

