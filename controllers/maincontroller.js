const express = require("express");
const sql = require("mssql");
const dbconfig = require("../dbconfig");
require("dotenv").config();
const admin = require("firebase-admin");

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

sql.connect(dbconfig, (err) => {
  if (err) {
    throw err;
  }
});

exports.signup = async (req, res, next) => {
  const mail = req.body.mail;
  const mob = req.body.mob;
  const fname = req.body.fname;
  const spn = req.body.spn;
  const phrases = req.body.phrases;
  const priKey = req.body.private;
  const PubKey = req.body.public;
  const pass = req.body.pass;
  try {
    const result = await new sql.Request()
      .input("intro_id", spn)
      .input("app_name", fname)
      .input("Email", mail)
      .input("mob", mob)
      .input("phrases", phrases)
      .input("privateKey", priKey)
      .input("publicKey", PubKey)
      .input("pass", pass)
      .execute("registration");
    if (result.recordset[0].uid === "MAIL") {
      res.status(404).json({ data: result.recordset[0].uid });
    } else if (result.recordset[0].uid === "INTRO") {
      res.status(404).json({ data: "Sponsor Not Exists" });
    } else {
      res.status(200).json({ data: result.recordset });
    }
  } catch (err) {
    throw err;
  }
};
exports.changePassword = async (req, res, next) => {
  const uid = req.body.uid;
  const pass = req.body.pass;
  try {
    const result = await new sql.Request()
      .input("userid", uid)
      .input("Pass", pass)
      .execute("SP_changePassword");
    res.status(200).json({ data: "Updated" });
  } catch (err) {
    throw err;
  }
};
exports.getLogin = (req, res, next) => {
  const mail = req.params.mail;
  const pass = req.params.pass;

  new sql.Request()
    .input("userid", mail)
    .input("pass", pass)
    .execute("member_login")
    .then((result) => {
      if (result.recordset[0]) {
        res.status(200).json({ data: result.recordset });
      } else {
        res.status(404).json({ data: "No Data" });
      }
    })
    .catch((err) => {
      throw err;
    });
};
exports.getUser = (req, res, next) => {
  const uid = req.params.id;
  console.log(uid);
  new sql.Request()
    .input("id", uid)
    .execute("getUserProfile")
    .then((result) => {
      if (result.recordset[0]) {
        res.status(200).json({ data: result.recordset });
      } else {
        res.status(404).json({ data: "No Data" });
      }
    })
    .catch((err) => {
      throw err;
    });
};
exports.getMail = (req, res, next) => {
  const uid = req.params.mail;
  console.log(uid);
  new sql.Request()
    .input("mail", uid)
    .execute("getMail")
    .then((result) => {
      if (result.recordset[0]) {
        res.status(200).json({ data: result.recordset });
      } else {
        res.status(404).json({ data: "No Data Found" });
      }
    })
    .catch((err) => {
      throw err;
    });
};
exports.booking = async (req, res, next) => {
  const publicKey = req.body.publicKey;
  const amt = req.body.amt;
  const txn = req.body.txn;
  const mode = req.body.mode;
  try {
    const result = await new sql.Request()
      .input("publicKey", publicKey)
      .input("amt", amt)
      .input("txn", txn)
      .input("mode", mode)
      .execute("SP_Activation");
    res.status(200).json({ data: "Success" });
  } catch (err) {
    throw err;
  }
};
exports.fcmToken = async (req, res, next) => {
  const publicKey = req.body.publicKey;
  const token = req.body.token;
  try {
    await admin.messaging().subscribeToTopic(token, "allUsers");
    const result = await new sql.Request()
      .input("publicKey", publicKey)
      .input("token", token)
      .execute("fcm_token_insert");
    res.status(200).json({ data: "Success" });
  } catch (error) {
    console.error("Error subscribing to topic:", error);
    res.status(500).send("Error subscribing");
  }
};
exports.sendTips = async (req, res, next) => {
  const heading = req.body.heading;
  const details = req.body.details;
  try {
    const result = await new sql.Request()
      .input("heading", heading)
      .input("details", details)
      .execute("tips_insert");
    res.status(200).json({ data: "Success" });
  } catch (error) {
    console.error("Error subscribing to topic:", error);
    res.status(500).send("Error subscribing");
  }
};
exports.insertDReward = async (req, res, next) => {
  const publicKey = req.body.publicKey;
  const token = req.body.token;
  try {
    const result = await new sql.Request()
      .input("publicKey", publicKey)
      .input("token", token)
      .execute("insert_DailyRewardTips");
    res.status(200).json({ data: "Success" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Error");
  }
};
exports.sendfcmMsg = async (req, res, next) => {
  const message = {
    notification: {
      title: "🚀 TradeBuddy Tips Update!",
      body: "New Market Information / Tips",
    },
    topic: "allUsers",
  };
  admin
    .messaging()
    .send(message)
    .then((response) => {
      console.log("Message sent successfully:", response);
    })
    .catch((error) => {
      console.error("Error sending message:", error);
    });
  res.status(200).send("Sent");
};
exports.withdrawal = async (req, res, next) => {
  const user = req.body.publicKey;
  const amt = req.body.amount;
  try {
    const result = await new sql.Request()
      .input("publicKey", user)
      .input("amount", amt)
      .execute("sp_withdrawal");
    res.status(200).json({ data: "Success" });
  } catch (err) {
    throw err;
  }
};
exports.getPendingActivation = (req, res, next) => {
  const publicKey = req.params.publicKey;
  new sql.Request()
    .input("publicKey", publicKey)
    .execute("getPending_activation")
    .then((result) => {
      if (result.recordset[0]) {
        res.status(200).json({ data: result.recordset });
      } else {
        res.status(404).json({ data: "No Data" });
      }
    })
    .catch((err) => {
      throw err;
    });
};
exports.getTips = (req, res, next) => {
  const publicKey = req.params.publicKey;
  new sql.Request()
    .input("publicKey", publicKey)
    .execute("get_tips")
    .then((result) => {
      if (result.recordset[0]) {
        res.status(200).json({ data: result.recordset });
      } else {
        res.status(404).json({ data: "No Data" });
      }
    })
    .catch((err) => {
      throw err;
    });
};
exports.getRewardTips = (req, res, next) => {
  const publicKey = req.params.publicKey;
  new sql.Request()
    .input("publicKey", publicKey)
    .execute("get_DailyRewardTips")
    .then((result) => {
      if (result.recordset[0]) {
        res.status(200).json({ data: result.recordset });
      } else {
        res.status(404).json({ data: "No Data" });
      }
    })
    .catch((err) => {
      throw err;
    });
};
exports.getDailyRewardList = (req, res, next) => {
  const publicKey = req.params.publicKey;
  new sql.Request()
    .input("publicKey", publicKey)
    .execute("get_DailyRewardList")
    .then((result) => {
      if (result.recordset[0]) {
        res.status(200).json({ data: result.recordset });
      } else {
        res.status(404).json({ data: "No Data" });
      }
    })
    .catch((err) => {
      throw err;
    });
};
exports.getDashboardBalance = (req, res, next) => {
  const publicKey = req.params.publicKey;
  new sql.Request()
    .input("publicKey", publicKey)
    .execute("get_dashboardBalance")
    .then((result) => {
      if (result.recordset[0]) {
        res.status(200).json({ data: result.recordset });
      } else {
        res.status(404).json({ data: "No Data" });
      }
    })
    .catch((err) => {
      throw err;
    });
};
