const express = require("express");
const sql = require("mssql");
const dbconfig = require("../dbconfig");

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
