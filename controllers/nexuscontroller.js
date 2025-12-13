const express = require("express");
//const sql = require("mssql");
//const dbconfig = require("../dbconfig_nexs");
const { sql, pool2 } = require("../nexusdb");
require("dotenv").config();
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { ethers } = require("ethers");

const USDT_ADDRESS = "0x55d398326f99059fF775485246999027B3197955";
const ERC20_ABI = [
  "function transfer(address to, uint256 amount) returns (bool)",
];

// Setup provider & wallet
const provider = new ethers.JsonRpcProvider(
  "https://bsc-dataseed.binance.org/"
);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY_NEXUS, provider);
const usdt = new ethers.Contract(USDT_ADDRESS, ERC20_ABI, wallet);

// sql.connect(dbconfig, (err) => {
//   if (err) {
//     throw err;
//   }
// });

// const transporter = nodemailer.createTransport({
//   host: "smtppro.zoho.in",
//   port: 465, // use 465 for SSL, 587 for TLS
//   secure: true, // you can use "Outlook", "Yahoo", or a custom SMTP
//   auth: {
//     user: "support@tradebuddy.biz",
//     pass: "4g9eRnRhhLps", // ⚠️ For Gmail, use App Password (not normal password)
//   },
// });

exports.signup = async (req, res, next) => {
  const spn = req.body.spn;
  const name = req.body.name;
  const PubKey = req.body.public;
  const amt = req.body.amt;
  const txn = req.body.txn;
  try {
    const pool = await pool2;
    const result = await pool
      .request()
      .input("intro_id", spn)
      .input("name", name)
      .input("publicKey", PubKey)
      .input("amt", amt)
      .input("txn", txn)
      .execute("registration");
    console.log(result.recordset[0].uid);
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
// exports.withdrawUsdt = async (req, res, next) => {
//   try {
//     const { to, amount } = req.body; // amount in USDT
//     if (!to || !amount) {
//       return res.status(400).json({ msg: "Missing parameters" });
//     }

//     // Convert to 18 decimals (USDT on BSC uses 18)
//     const value = ethers.parseUnits(amount.toString(), 18);

//     // Send transaction
//     const tx = await usdt.transfer(to, value);
//     //await tx.wait();

//     res.status(200).json({ msg: "success", txHash: tx.hash });
//   } catch (err) {
//     if (err.transaction && err.transaction.hash) {
//       // This means broadcast succeeded, but something else (like timeout) failed
//       return res.status(200).json({
//         msg: "success",
//         txHash: err.transaction.hash,
//         warning:
//           "Response delayed — transaction may still be pending confirmation",
//       });
//     }
//     console.error("Withdraw error:", err);
//     //res.status(500).json({ msg: err.message });
//     res.status(500).json({
//       msg: "success",
//       txHash: "Return Time Out. Txn Hash will appear soon",
//     });
//   }
// };

exports.getUser = async (req, res, next) => {
  const uid = req.params.id;
  const pool = await pool2;
  await pool
    .request()
    .input("id", uid)
    .execute("getUserProfile")
    .then((result) => {
      if (result.recordset[0]) {
        res.status(200).json({ data: result.recordset, extra: uid });
      } else {
        res.status(404).json({ data: "No Data", extra: uid });
      }
    })
    .catch((err) => {
      throw err;
    });
};

exports.booking = async (req, res, next) => {
  const txn = req.body.txn;
  const type = req.body.type;
  try {
    const pool = await pool2;
    const result = await pool
      .request()
      .input("txn", txn)
      .input("type", type)
      .execute("success_Activation");
    res.status(200).json({ data: "Success" });
  } catch (err) {
    throw err;
  }
};
// exports.withdrawalCheck = async (req, res, next) => {
//   const txn = req.body.txn;
//   const type = req.body.type;
//   try {
//     const result = await new sql.Request()
//       .input("txn", txn)
//       .input("type", type)
//       .execute("withdrawal_statusUpdate");
//     res.status(200).json({ data: "Success" });
//   } catch (err) {
//     throw err;
//   }
// };
// exports.topup = async (req, res, next) => {
//   const publicKey = req.body.publicKey;
//   const amt = req.body.amt;
//   const txn = req.body.txn;
//   const mode = req.body.mode;
//   try {
//     const result = await new sql.Request()
//       .input("publicKey", publicKey)
//       .input("amt", amt)
//       .input("txn", txn)
//       .input("mode", mode)
//       .execute("SP_Topup");
//     res.status(200).json({ data: result.recordset });
//   } catch (err) {
//     throw err;
//   }
// };

// exports.withdrawal = async (req, res, next) => {
//   const user = req.body.publicKey;
//   const amt = req.body.amount;
//   const txn = req.body.txn;
//   try {
//     const result = await new sql.Request()
//       .input("publicKey", user)
//       .input("amount", amt)
//       .input("txn", txn)
//       .execute("sp_withdrawal");
//     res.status(200).json({ data: result.recordset });
//   } catch (err) {
//     throw err;
//   }
// };
// exports.withdrawal_update = async (req, res, next) => {
//   const withSl = req.body.withSl;
//   const txn = req.body.txn;
//   try {
//     const result = await new sql.Request()
//       .input("withSl", withSl)
//       .input("txn", txn)
//       .execute("update_withdrawal_txn");
//     res.status(200).json({ data: "Success" });
//   } catch (err) {
//     throw err;
//   }
// };
exports.getPendingActivation = async (req, res, next) => {
  const publicKey = req.params.publicKey;
  const pool = await pool2;
  await pool
    .request()
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
// exports.getPendingWithdraw = (req, res, next) => {
//   const publicKey = req.params.publicKey;
//   new sql.Request()
//     .input("publicKey", publicKey)
//     .execute("pendingWithdrawal")
//     .then((result) => {
//       if (result.recordset[0]) {
//         res.status(200).json({ data: result.recordset });
//       } else {
//         res.status(404).json({ data: "No Data" });
//       }
//     })
//     .catch((err) => {
//       throw err;
//     });
// };
// exports.getGenealogy = (req, res, next) => {
//   const publicKey = req.params.publicKey;
//   new sql.Request()
//     .input("uid", publicKey)
//     .execute("getGenealogy")
//     .then((result) => {
//       if (result.recordset[0]) {
//         res.status(200).json({ data: result.recordset });
//       } else {
//         res.status(404).json({ data: "No Data" });
//       }
//     })
//     .catch((err) => {
//       throw err;
//     });
// };

exports.getDashboardBalance = async (req, res, next) => {
  const publicKey = req.params.publicKey;
  const pool = await pool2;
  await pool
    .request()
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
exports.getMyPackages = async (req, res, next) => {
  const uid = req.params.phrases;
  const pool = await pool2;
  await pool
    .request()
    .input("uid", uid)
    .execute("getMyPackage")
    .then((result) => {
      res.status(200).json({ data: result.recordset });
    })
    .catch((err) => {
      throw err;
    });
};

exports.getDirect = async (req, res, next) => {
  const uid = req.params.uid;
  console.log(uid);
  const pool = await pool2;
  await pool
    .request()
    .input("uid", uid)
    .execute("getDirect")
    .then((result) => {
      res.status(200).json({ data: result.recordset });
    })
    .catch((err) => {
      throw err;
    });
};

exports.getDownline = async (req, res, next) => {
  const uid = req.params.uid;
  const pool = await pool2;
  await pool
    .request()
    .input("uid", uid)
    .execute("getDownline_list")
    .then((result) => {
      res.status(200).json({ data: result.recordset });
    })
    .catch((err) => {
      throw err;
    });
};
// exports.getIncomeStatement = (req, res, next) => {
//   const uid = req.params.uid;
//   const type = req.params.type;
//   console.log(uid);
//   new sql.Request()
//     .input("uid", uid)
//     .input("type", type)
//     .execute("get_RewardStatement")
//     .then((result) => {
//       res.status(200).json({ data: result.recordset });
//     })
//     .catch((err) => {
//       throw err;
//     });
// };
