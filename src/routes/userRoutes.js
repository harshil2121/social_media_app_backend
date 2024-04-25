// userRoutes.js
const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { upload } = require("../middleware/multer");

// Register route
router.post("/register", upload.single("logo"), userController.register);

// Login route
router.post("/login", userController.login);

// Forgot password route
// router.post("/forgot-password", userController.forgotPassword);

module.exports = router;
