const axios = require("axios");
const HttpError = require("../models/http-error");
const API_KEY = "AIzaSyCyoOWrYRMJ9tfarx8cf07YYOtl-fdGXG4";

async function getCoordsForAddress(address) {
  
  const response = await axios.post(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${API_KEY}`)
  
  const data = response.data;

  if (!data || data.status === "ZERO_RESULTS") {
    const error = new HttpError("Could not foud the location for the specified address", 422);

    throw error;
  }
  
  const coordinates = data.results[0].geometry.location;

  console.log("COORDINATES", coordinates);
  return coordinates;
}

module.exports = getCoordsForAddress;