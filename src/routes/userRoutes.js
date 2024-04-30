// userRoutes.js
const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { upload } = require("../middleware/multer");
const auth = require("../middleware/auth");

router.post("/register", upload.single("logo"), userController.register);
router.post("/login", userController.login);
router.get("/logout", auth, userController.logout);
// router.post("/forgot-password", userController.forgotPassword);
router.post("/change-password", auth, userController.changePassword);
router.get("/check", auth, userController.check);
router.put("/edit/:id", auth, upload.single("logo"), userController.editUser);
router.get("/get/:id", auth, userController.getUserDetails);
router.post("/getAlluser", auth, userController.getAllUserDeta);

module.exports = router;
