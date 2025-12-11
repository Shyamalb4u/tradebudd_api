const express = require("express");
const userController = require("../controllers/nexuscontroller");

const router = express.Router();

router.get("/getUser/:id", userController.getUser);
// router.get(
//   "/pending_activation/:publicKey",
//   userController.getPendingActivation
// );
// router.get("/pending_withdraw/:publicKey", userController.getPendingWithdraw);
// router.get("/genealogy/:publicKey", userController.getGenealogy);
// router.get(
//   "/getDashboardBalance/:publicKey",
//   userController.getDashboardBalance
// );
// router.get("/getMyPackages/:phrases", userController.getMyPackages);
// router.get("/getDownline/:uid", userController.getDownline);
// router.get("/getIncomeStatement/:uid/:type", userController.getIncomeStatement);
// //////////////////
// router.post("/signup", userController.signup);
// router.post("/booking", userController.booking);
// router.post("/withdrawalCheck", userController.withdrawalCheck);
// router.post("/topup", userController.topup);
// router.post("/withdrawUsdt", userController.withdrawUsdt);
// router.post("/withdrawal", userController.withdrawal);
// router.post("/withdrawal_update", userController.withdrawal_update);
module.exports = router;
