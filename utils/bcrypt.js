const bcrypt = require("bcrypt");

exports.encryptFun = (saltRounds, password) => {
  const salt = bcrypt.genSaltSync(saltRounds);
  const hash = bcrypt.hashSync(password, salt)

  return hash;
} 
