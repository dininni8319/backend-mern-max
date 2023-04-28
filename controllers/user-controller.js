const HttpError = require('../models/http-error');
const { validationResult } = require('express-validator');
const bcrypt = require("bcrypt");
const User = require("../models/user");

exports.getUserList = async (req, res, next) => {

  let users;
  try {
    users = await User.find({}, "-password")
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

  const saltRounds = 10;
  const salt = bcrypt.genSaltSync(saltRounds);
  console.log(salt, password, "testing the password and the string");
  const hash = bcrypt.hashSync(password, salt)

  const newUser = new User({
    name,
    email,
    image: "https://picsum.photos/200",
    password: hash,
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
   
  res.status(201).json({user:newUser.toObject({ getters: true})})
  };

exports.signin = async (req, res, next) => {
  const { email, password } = req.body;

  let emailExists = await User.findOne({email: email});

  const validatePassword = (hash) => {
    let data = bcrypt
      .compare(password, hash)
      .then(data => {
        if (data) {
          let response = { 
            message: "correct password", 
            user: emailExists.toObject({getters: true})
          }
          
          return res.status(200).json(response); 
        }
        return res.status(401).json({message: "Invalid credentials, please try it again.", authenticated: data})
      })
    return data;
  };

  if (emailExists) {
     await validatePassword(emailExists.password);
  } else {
    const error = new HttpError('The credential are not correct.', 401);
    return next(error);
  }
};

