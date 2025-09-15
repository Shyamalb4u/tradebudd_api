const express = require("express");
const sql = require("mssql");
const dbconfig = require("../dbconfig");
require("dotenv").config();
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

sql.connect(dbconfig, (err) => {
  if (err) {
    throw err;
  }
});

const transporter = nodemailer.createTransport({
  host: "smtppro.zoho.in",
  port: 465, // use 465 for SSL, 587 for TLS
  secure: true, // you can use "Outlook", "Yahoo", or a custom SMTP
  auth: {
    user: "support@tradebuddy.biz",
    pass: "4g9eRnRhhLps", // ⚠️ For Gmail, use App Password (not normal password)
  },
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
      if (result) {
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
exports.getMyPackages = (req, res, next) => {
  const uid = req.params.phrases;
  new sql.Request()
    .input("uid", uid)
    .execute("getMyPackage")
    .then((result) => {
      res.status(200).json({ data: result.recordset });
    })
    .catch((err) => {
      throw err;
    });
};
exports.getDirect = (req, res, next) => {
  const uid = req.params.uid;
  console.log(uid);
  new sql.Request()
    .input("uid", uid)
    .execute("getDirect")
    .then((result) => {
      res.status(200).json({ data: result.recordset });
    })
    .catch((err) => {
      throw err;
    });
};
exports.getDownline = (req, res, next) => {
  const uid = req.params.uid;
  console.log(uid);
  new sql.Request()
    .input("uid", uid)
    .execute("getDownline_list")
    .then((result) => {
      res.status(200).json({ data: result.recordset });
    })
    .catch((err) => {
      throw err;
    });
};
exports.getIncomeStatement = (req, res, next) => {
  const uid = req.params.uid;
  const type = req.params.type;
  console.log(uid);
  new sql.Request()
    .input("uid", uid)
    .input("type", type)
    .execute("get_RewardStatement")
    .then((result) => {
      res.status(200).json({ data: result.recordset });
    })
    .catch((err) => {
      throw err;
    });
};
exports.insertTransaction = async (req, res, next) => {
  const publicKey = req.body.publicKey;
  const amt = req.body.amt;
  const txn = req.body.txn;
  const details = req.body.details;
  const symbol = req.body.symbol;
  const status = req.body.status;
  try {
    const result = await new sql.Request()
      .input("publicKey", publicKey)
      .input("txn", txn)
      .input("details", details)
      .input("amount", amt)
      .input("symbol", symbol)
      .input("status", status)
      .execute("insert_transaction");
    res.status(200).json({ data: "Success" });
  } catch (err) {
    throw err;
  }
};
exports.sendMail = async (req, res, next) => {
  const toMail = req.body.mail;
  const uid = req.body.uid;
  const name = req.body.name;
  const pass = req.body.pass;
  const subject = "Registration Successful. Welcome To Trade Buddy";
  const htmlTemplate = `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
      <h2 style="color:#0066cc;">Hello ${name},</h2>
      <p>Welcome to Trade Buddy</p>
      <blockquote style="border-left: 4px solid #0066cc; padding-left: 10px; color: #555;">
       Your Trade Buddy Login Details :<br />
       User Name : ${toMail} <br />
       Password : ${pass}<br />
       Refer UID : ${uid}
      </blockquote>
      <p style="margin-top:20px;">Best Regards,<br/>🔑 Change your password frequently.</p>
      <p style="margin-top:20px;">Best Regards,<br/>🚀 Team Trade Buddy</p>
    </div>
  `;
  try {
    const info = await transporter.sendMail({
      from: '"Trade Buddy" support@tradebuddy.biz', // sender address
      to: toMail, // receiver
      subject, // email subject
      html: htmlTemplate, // email body as HTML
    });

    res.json({ success: true, msg: "Email sent successfully" });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, msg: "Failed to send email", error: err });
  }
};
