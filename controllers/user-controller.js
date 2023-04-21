const HttpError = require('../models/http-error');

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

  res.status(200).json(DUMMY_USER);
};

exports.registerUser = (req, res, next) => {
  const { username, email, password } = req.body;
  const newUser = {
    username,
    email,
    password
  };
  if (!newUser.username) {
    const error = new HttpError('User was not created.', 404);
    throw error;
    // res.json(error)
  }

  DUMMY_USER.push(newUser)
   
  res.status(201).json(newUser)

};


exports.signIn = (req, res, next) => {
  const { email, password } = req.body;

  let emailExists = DUMMY_USER.find(user => user.email === email)
  let passwordExists = DUMMY_USER.find(user => user.password === password);
  
  if (emailExists && passwordExists) {
    return res.status(200).json({message: "You are logged in."})
  }
  const error = new HttpError('The credential are not correct.', 404);
  throw error;
};

