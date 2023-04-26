const HttpError = require('../models/http-error');
const {v4: uuidv4 } = require("uuid");
const { validationResult } = require('express-validator');
const bcrypt = require("bcrypt");
const User = require("../models/user");

let DUMMY_USER = [
  {
    id: "u1",
    name: "Salvatore Dininni",
    email: "s.dininni@yahoo.com",
    password: "123456789"   
  },
  {
    id: "u2",
    name: "Mario Bianch",
    email: "mario.bianchi@yahoo.com",
    password: "1234567"  
  }
];

exports.getUserList = (req, res, next) => {

  res.status(200).json({ users:DUMMY_USER });
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
  const hash = bcrypt.hashSync(password, salt)

  const newUser = new User({
    name,
    email,
    image: "https://picsum.photos/200",
    // password,
    password: hash,
    places: "test"
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
  // console.log(newUser, "TESTING THE NEWUSER");
  if (!newUser.name) {
    const error = new HttpError('User was not created.', 404);
    return next(error); 
    // res.json(error)
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
          let response = { message: "correct password", authenticated: data}
          return res.status(200).json(response); 
        }
        return res.status(401).json({message: "unauthorized", authenticated: data})
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

