const express = require("express");
const userController = require("../controllers/maincontroller");

const router = express.Router();

router.get("/getUser/:id", userController.getUser);
router.get("/getMail/:mail", userController.getMail);
router.get("/login/:mail/:pass", userController.getLogin);
//////////////////
router.post("/signup", userController.signup);
router.post("/changePassword", userController.changePassword);

module.exports = router;
