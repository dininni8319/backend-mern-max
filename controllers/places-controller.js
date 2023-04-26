const {v4: uuidv4 } = require("uuid");
const HttpError = require('../models/http-error');
const { validationResult } = require('express-validator');
const getCoordsForAddress =require("../utils/location");
const Place = require("../models/place");

let DUMMY_PLACES = [
  {
    id: "p1",
    title: "Empire State Building",
    description: "One of the most famous sky scrapers in the world!",
    location: {
      lat: 40.7484474,
      lng: -73.9871516
    },
    address: "20 W 34th St., New York, NY 10001, USA",
    creator: "u1"
  },
  {
    id: "p2",
    title: "Eiffel Tower in Paris",
    description: "Come and discover the Eiffel Tower on the only trip to the top of its kind in Europe, and let pure emotions carry you from the esplanade to the top.!",
    location: {
      lat: 48.8584,
      lng: 2.2945
    },
    address: "Champ de Mars, 5 Av. Anatole France ",
    creator: "u1"
  }
];

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

  res.json({ places: places.map(place => place.toObject({ getters: true }))});
  // if (!userPlace) {
  //   return next(
  //     new HttpError("Could not find a place for the provided id.", 404)
  //   );
  // } else {
  //   res.json({messase: 'It works!', userPlace});
  // }
};

exports.createPlace = async (req, res, next) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return next(new HttpError("Invalid input passed, please check your data.", 422));
  };

  const { 
    title, 
    description, 
    address, 
    creator
  } = req.body;

  let coordinates;
  try {
    coordinates = await getCoordsForAddress(address);
    
  } catch (error) {
    return next(error);
  };

  const createPlace = new Place({
    title,
    description,
    address,
    location: coordinates,
    image: "https://www.google.com/url?sa=i&url=https%3A%2F%2Fen.wikipedia.org%2Fwiki%2FColosseum&psig=AOvVaw0Tmmcx2DFsQhQnHbT8qViH&ust=1682527459731000&source=images&cd=vfe&ved=0CBEQjRxqFwoTCKCEka69xf4CFQAAAAAdAAAAABAE",
    creator: creator
  });

  // DUMMY_PLACES.push(createPlace)
  try {
    await createPlace.save();
  } catch (error) {
    error = new HttpError("Creating place failed, please try again", 500)
    return next(error);
  }

  res.status(201).json({place: createPlace });
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
  } catch (error) {
    throw new HttpError("Issue with updating.", 422);
  }

  res.status(200).json({place: place.toObject({ getters: true })});
};

exports.deletePlace = async (req, res, next) => {
  
  const { pid } = req.params;

  let place;
  try {
    place = await Place.findOneAndDelete({"_id": pid})
     .exec();
  } catch (err) {
    
    return next(new HttpError("Could not find the place", 404));
  }

  res.status(200).json({message: "Place deleted."})
};

