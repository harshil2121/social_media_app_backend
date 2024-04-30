// userRoutes.js
const express = require("express");
const router = express.Router();
const followController = require("../controllers/followController");
const auth = require("../middleware/auth");

router.get("/user-follow/:id", auth, followController.followUser);
router.get("/user-unfollow/:id", auth, followController.unfollowUser);

module.exports = router;
