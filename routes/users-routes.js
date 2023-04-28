const express = require("express");
const { check } = require('express-validator');
const router = express.Router();
const fileUpload = require("../middleware/file-upload");

const {
  getUserList,
  signup,
  signin,
} = require("../controllers/user-controller");

router.get("/", getUserList);
router.post("/signup", 
 fileUpload.single("image"),
[
 check("email")
  .normalizeEmail()
  .isEmail(),
 check('password')
  .isLength({min: 8}),
 check('name')
  .not()
  .isEmpty()
], signup);
router.post("/signin", signin);

module.exports = router;