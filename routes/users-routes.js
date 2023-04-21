const express = require("express");

const router = express.Router();

const {
  getUserList,
  registerUser,
  signIn,

} = require("../controllers/user-controller");
router.get("/", getUserList);
router.post("/signup", registerUser);
router.post("/signin", signIn);

module.exports = router;