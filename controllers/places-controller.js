const {v4: uuidv4 } = require("uuid");
const HttpError = require('../models/http-error');
const { validationResult } = require('express-validator');
const getCoordsForAddress =require("../utils/location");

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

exports.getAllPlaces = (req, res, next) => {
  const allPlaces = DUMMY_PLACES;

  res.status(200).json({ places: allPlaces})
};

exports.getPlaceById = (req, res, next) => {
  const { pid } = req.params; // { pid: "p1" }

  const place = DUMMY_PLACES.find(place => place.id === pid);

  if (!place) {
    throw error = new HttpError("Could not find a place for the provided id.", 404);
  } else {
    res.json({messase: 'It works!', place});
  }
};

exports.getPlacesByUserId = (req, res, next) => {
  const { uid } = req.params;

  const userPlace = DUMMY_PLACES.filter(place => place.creator === uid);

  if (!userPlace) {
    return next(
      new HttpError("Could not find a place for the provided id.", 404)
    );
  } else {
    res.json({messase: 'It works!', userPlace});
  }
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

  const createPlace = {
    title, 
    description,
    location: coordinates,
    address,
    creator
  }

  DUMMY_PLACES.push(createPlace)
  
  res.status(201).json({place: createPlace});
};

exports.updatePlace = (req, res, next) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    throw new HttpError("Invalid input passed, please check your data.", 422);
  };
  
  const { pid } = req.params; 
  
  const { 
    title, 
    description, 
  } = req.body;

  const updatedPlace = {...DUMMY_PLACES.find(p => p.id === pid)};
  const placeIndex = DUMMY_PLACES.findIndex(p => p.id === pid);

  updatedPlace.title = title;
  updatedPlace.description = description;

  DUMMY_PLACES[placeIndex] = updatedPlace;

  res.status(200).json({place: updatedPlace});
};

exports.deletePlace= (req, res, next) => {
  
  const { pid } = req.params;
  if(!DUMMY_PLACES.find(place => place.id === pid)) {
    throw new HttpError("Could not find the place", 404);
  }

  DUMMY_PLACES.filter(p => p.id !== pid);

  res.status(200).json({message: "Delete place"})
};

