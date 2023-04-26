const { Schema, model } = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const userSchema = Schema({
  name: {
    type: String,
    required:true
  },
  email: {
    type: String,
    required:true,
    unique: true //speed up the quering process
  },
  password: {
    type: String,
    required:true,
    minlength: 6
  },
  image: {
    type: String,
    required: true
  },
  places: {
    type: String,
    required: true
  },
})

//with the unique validator package we make sure the user is unique 
userSchema.plugin(uniqueValidator)

module.exports = model("User", userSchema)