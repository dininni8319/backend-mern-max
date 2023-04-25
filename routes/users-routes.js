const express = require("express");
const { check } = require('express-validator');
const router = express.Router();

const {
  getUserList,
  signup,
  signin,
} = require("../controllers/user-controller");

router.get("/", getUserList);
router.post("/signup", [
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