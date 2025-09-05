const express = require("express");
const userController = require("../controllers/maincontroller");

const router = express.Router();

router.get("/getUser/:id", userController.getUser);
router.get("/getMail/:mail", userController.getMail);
router.get("/login/:mail/:pass", userController.getLogin);
router.get(
  "/pending_activation/:publicKey",
  userController.getPendingActivation
);
//////////////////
router.post("/signup", userController.signup);
router.post("/changePassword", userController.changePassword);
router.post("/getDailyTips", userController.changePassword);
router.post("/booking", userController.booking);

module.exports = router;
