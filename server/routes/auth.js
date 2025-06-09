const express = require("express");
const router = express.Router();
const authController = require("../controller/auth");
const { loginCheck, isAuth, isAdmin } = require("../middleware/auth");

router.post("/signup", authController.postSignup);
router.post("/signin", authController.postSignin);
router.post("/create-admin", authController.createAdmin);
router.post("/is-admin", loginCheck, authController.isAdmin);
router.get("/all-user", loginCheck, isAuth, isAdmin, authController.allUser);

module.exports = router;
