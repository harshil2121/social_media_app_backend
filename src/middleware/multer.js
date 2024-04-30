const multer = require("multer");
const fs = require("fs");

const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === "logo") {
      console.log("cvcvcvc", file);
      const uploadDir = `${process.env.UPLOAD_DIR}`;
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    } else if (file.fieldname === "postimg") {
      const uploadPostDir = `${process.env.UPLOAD_POST_DIR}`;
      if (!fs.existsSync(uploadPostDir)) {
        fs.mkdirSync(uploadPostDir, { recursive: true });
      }
      cb(null, uploadPostDir);
    } else {
      cb(new Error("Invalid fieldname"));
    }
  },
  filename: (req, file, cb) => {
    const fileExt = file.originalname.split(".").pop();
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

exports.upload = multer({
  storage: multerStorage,
  fileFilter: (req, file, cb) => {
    if (file.fieldname === "logo") {
      if (
        file.mimetype == "image/png" ||
        file.mimetype == "image/jpg" ||
        file.mimetype == "image/jpeg"
      ) {
        cb(null, true);
      } else {
        return cb(null, false);
      }
    } else if (file.fieldname === "postimg") {
      if (
        file.mimetype.startsWith("image/") ||
        file.mimetype.startsWith("video/")
      ) {
        cb(null, true);
      } else {
        cb(new Error("Invalid file type"));
      }
    } else {
      cb(new Error("Invalid fieldname"));
    }
  },
});
