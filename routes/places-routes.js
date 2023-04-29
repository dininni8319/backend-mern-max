const express = require('express');
const { check } = require("express-validator");
const fileUpload = require("../middleware/file-upload"); //object with a banch of middleware
const checkAuth = require("../middleware/check-auth");
const {
  getPlaceById,
  getAllPlaces, 
  getPlacesByUserId,
  createPlace,
  updatePlace,
  deletePlace, 
 } = require('../controllers/places-controller');

const router = express.Router();

router.get("/", getAllPlaces)
router.get('/:pid', getPlaceById);
router.get('/user/:uid', getPlacesByUserId);
router.use(checkAuth);
router.post(
   "/",
   fileUpload.single("image"),
   [
    check("title")
     .not()
     .isEmpty(),
    check("description").isLength({min: 5}),
    check("address")
      .not()
      .isEmpty(),
   ], 
  createPlace
);

router.patch(
  "/:pid",
  [
     check("title")
      .not()
      .isEmpty(),
     check("description").isLength({ min: 5 })
  ],
 updatePlace
)
router.delete("/:pid", deletePlace)

module.exports = router;