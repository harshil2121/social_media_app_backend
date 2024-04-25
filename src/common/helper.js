const moment = require("moment");
const momentTZ = require("moment-timezone");
// const dotenv = require("dotenv").config();
var path = require("path");
// var CryptoJS = require("crypto-js");
const fs = require("fs");

// const TIME_ZONE = process.env.TIME_ZONE || "Australia/Sydney";
const getCurrentTime = () => moment().format("YYYY-MM-DD HH:mm:ss");
const getDateTime = (date) => moment(date).format("YYYY-MM-DD HH:mm:ss");

const getcrntmilisec = () => moment(getCurrentTime()).valueOf();

const generatePassword = () => {
  var length = 8,
    charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
    retVal = "";
  for (var i = 0, n = charset.length; i < length; ++i) {
    retVal += charset.charAt(Math.floor(Math.random() * n));
  }
  return retVal;
};

const getLogo = () => {
  let logo = [
    {
      filename: "minbly-logo.png",
      path: path.resolve(
        __dirname.replace("/helpers", ""),
        "assets/logo/minbly-logo.png"
      ),
      cid: "logo",
    },
  ];

  return logo;
};

const encryptPlainText = (plainText) => {
  try {
    return CryptoJS.AES.encrypt(
      plainText,
      process.env.CRYPTO_SECRET_KEY
    ).toString();
  } catch (error) {
    console.log(error);
  }
};

const TotalDaysInAMonth = (date) => {
  return moment(date).daysInMonth();
};

const generateReferenceNumber = () => {
  var length = 6,
    charset = "0123456789",
    retVal = "";
  for (var i = 0, n = charset.length; i < length; ++i) {
    retVal += charset.charAt(Math.floor(Math.random() * n));
  }
  return retVal;
};

const unlinkFiles = async (file) => {
  if (fs.existsSync(file)) {
    await fs.unlinkSync(file);
  }
};

const getSettings = async (type) => {
  const [settings, fields] = await connectPool.query(
    `SELECT description FROM settings WHERE type = ?`,
    [type]
  );
  if (settings.length > 0) {
    return settings[0].description;
  }
  return null;
};

const addNotifications = async (table_prefix, data) => {
  console.log(table_prefix);
  console.log(data);
  const [add_fields, fields] = await connectPool.query(
    `INSERT into ${table_prefix}notifications SET ?`,
    data
  );

  return add_fields;
};

const onboarding_user_setup = async (user_id) => {
  try {
    const [row_token, fields] = await connectPool.query(
      `SELECT * FROM onboardingModel`
    );

    if (row_token.length > 0) {
      for (let i = 0; i < row_token.length; i++) {
        let row = row_token[i].id;
        // console.log(row);
        const [row_onboardingData, fields_onboardingData] =
          await connectPool.query(`INSERT INTO onboarding_user_setup SET ?`, [
            {
              user_id: user_id,
              module_id: row,
            },
          ]);
      }
    }

    return row_token;
  } catch (e) {
    throw Error(e);
  }
};

const finish_setup_user = async (user_id) => {
  try {
    const [row_token, fields] = await connectPool.query(
      `SELECT * FROM finishSetupDataModel finishSetup_by_user`
    );

    if (row_token.length > 0) {
      for (let i = 0; i < row_token.length; i++) {
        let row = row_token[i].id;
        // console.log(row);
        const [row_onboardingData, fields_onboardingData] =
          await connectPool.query(`INSERT INTO finishSetup_by_user SET ?`, [
            {
              user_id: user_id,
              finish_setup_id: row,
              isSetupComplete: row === 1 ? 1 : 0,
            },
          ]);
      }
    }

    return row_token;
  } catch (e) {
    throw Error(e);
  }
};

module.exports = {
  getCurrentTime,
  getcrntmilisec,
  getDateTime,
  generatePassword,
  getLogo,
  encryptPlainText,
  TotalDaysInAMonth,
  generateReferenceNumber,
  unlinkFiles,
  getSettings,
  addNotifications,
  onboarding_user_setup,
  finish_setup_user,
};
