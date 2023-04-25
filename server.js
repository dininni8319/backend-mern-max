const express = require('express');
const bodyParser = require('body-parser');
const mogoose = require("mongoose");

const placesRoutes = require("./routes/places-routes");
const userRoutes = require("./routes/users-routes");
require('dotenv').config();

const HttpError = require('./models/http-error');

const app = express();
// this it will parse any incoming request body 
// and extract json data an convert in normal JS

app.use(bodyParser.json());
app.use('/api/places',placesRoutes); /// => /api/places/...
app.use('/api/user',userRoutes); /// => /api/places/...

app.use((req, res, next) => {
  const error = new HttpError("could not find this route.", 404)
  throw error;
});
// this will execute if there are any error
app.use((error, req, res, next) => {
  if (res.headerSent) {
    return next(error);
  }
  res.status(error.code || 500)
  res.json({message: error.message || "Ah unknown error occured!"})
});

mogoose
.connect(process.env.DATABASE)
.then(() => {
  console.log("Connected to the DB", 4000);
  app.listen(4000);
})
.catch((err) => {
  console.log(err);
})



