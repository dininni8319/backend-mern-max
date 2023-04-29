const mongoose = require("mongoose");
const HttpError = require('../models/http-error');
const { validationResult } = require('express-validator');
const getCoordsForAddress =require("../utils/location");
const Place = require("../models/place");
const User = require("../models/user");
const fs = require("fs");

exports.getAllPlaces = async (req, res, next) => {
  try {
    const allPlaces = await Place.find({}).exec();
    res.status(200).json({ places: allPlaces})
    
  } catch (err) {
    throw error = new HttpError("Could not find a place for the provided id.", 404);
  }
};

exports.getPlaceById = async (req, res, next) => {
  const { pid } = req.params; // { pid: "p1" }

  let place;
  try {
    place = await Place.findById(pid);
  } catch (err) {
    const error = new HttpError(
      "something went wrong, could not find a place.", 
      404
    );
    return next(error);
  }

  if (!place) {
    const  error = new HttpError(
      "Could not find a place for the provided id.", 
      404
    );
    return next(error);
  }
  // toObject method turns mongoose object into JS object 
  res.json({ place: place.toObject({ getters: true }) }); // => { place } => { place: place }
};

exports.getPlacesByUserId = async (req, res, next) => {
  const { uid } = req.params;

  let places;
  try {
    places = await Place.find({ creator: uid });
  } catch (err) {
    return next(
      new HttpError(
        "Fetching places failed, please try again later.",
        404
    )); 
  };

  if (places.length === 0) {
    return next(new HttpError(
      "Could not find a place with given id!"
    ));
  }
  res.json({ places: places.map(place => place.toObject({ getters: true }))});
};

exports.createPlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError('Invalid inputs passed, please check your data.', 422)
    );
  }

  const { title, description, address, creator } = req.body;

  let coordinates;
  try {
    coordinates = await getCoordsForAddress(address);
  } catch (error) {
    return next(error);
  }

  const createdPlace = new Place({
    title,
    description,
    address,
    location: coordinates,
    image: req.file.path,
    creator:creator
  });

  let user;
  try {
    user = await User.findById(creator);
  } catch (err) {
    const error = new HttpError('Creating place failed, please try again', 500);
    return next(error);
  }

  if (!user) {
    const error = new HttpError('Could not find user for provided id', 404);
    return next(error);
  }

  try {
    // await createdPlace.save();
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await createdPlace.save({ session: sess });
    user.places.push(createdPlace);
    await user.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError(
      'Creating place failed, please try again.',
      500
    );
    return next(error);
  }

  res.status(201).json({ place: createdPlace });
};

exports.updatePlace = async (req, res, next) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    throw new HttpError("Invalid input passed, please check your data.", 422);
  };
  
  const { pid } = req.params; 
  let place;
  
  try {
    place = await Place.findByIdAndUpdate({ _id: pid }, req.body, { new: true })
    .exec()
    if (place?.creator !== req.userData.userId) {
      const error = new HttpError(
        'You are not allowed to edit this place.',
        401 //authoratization error
      );
      return next(error);
    }
  } catch (error) {
    throw new HttpError("Issue with updating.", 422);
  }

  res.status(200).json({place: place?.toObject({ getters: true })});
};

exports.deletePlace = async (req, res, next) => {
  const placeId = req.params.pid;

  let place;
  try {
    place = await Place.findById(placeId).populate('creator');
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not delete place.',
      500
    );
    return next(error);
  }

  if (!place) {
    const error = new HttpError('Could not find place for this id.', 404);
    return next(error);
  }

  const image = place.image;
  console.log(image,'IMAGE');
 
  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await place.deleteOne({session: sess});
    place.creator.places.pull(place);
    await place.creator.save({session: sess});
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not delete place.',
      500
    );
    return next(error);
  }
  
  fs.unlink(image, (err) => {
    console.log(err);
  });

  res.status(200).json({ message: 'Deleted place.' });
};

