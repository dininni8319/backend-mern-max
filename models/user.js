const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const userSchema = mongoose.Schema({
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
  places: [
    {
      type: mongoose.Types.ObjectId, 
      required: true, 
      ref: "Place"
    }
  ]
},{ timestamps: true })

//with the unique validator package we make sure the user is unique 
userSchema.plugin(uniqueValidator)

module.exports = mongoose.model("User", userSchema)