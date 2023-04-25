const HttpError = require('../models/http-error');
const {v4: uuidv4 } = require("uuid");
const { validationResult } = require('express-validator');

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

exports.signup = (req, res, next) => {
  const error = validationResult(req);

  if (!error.isEmpty()) {
    const error = new HttpError("Invalid data input, please check your data.", 422);
    throw error;
  };

  const { name, email, password } = req.body;

  const hasUser = DUMMY_USER.find(user => user.email === email);

  if (hasUser) {
    const error = new HttpError('User already exists.', 422);
    throw error;
  };

  const newUser = {
    id: uuidv4(),
    name,
    email,
    password
  };

  // console.log(newUser, "TESTING THE NEWUSER");
  if (!newUser.name) {
    const error = new HttpError('User was not created.', 404);
    throw error;
    // res.json(error)
  }

  DUMMY_USER.push(newUser)
   
  res.status(201).json({user:newUser})
  };


exports.signin = (req, res, next) => {
  const { email, password } = req.body;

  let emailExists = DUMMY_USER.find(user => user.email === email);
  
  if (emailExists && emailExists.password === password) {
    return res.status(200).json({message: "You are logged in."})
  }
  const error = new HttpError('The credential are not correct.', 401);
  throw error;
};

