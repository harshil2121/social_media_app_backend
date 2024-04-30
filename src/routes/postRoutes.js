// userRoutes.js
const express = require("express");
const router = express.Router();
const postController = require("../controllers/postController");
const { upload } = require("../middleware/multer");
const auth = require("../middleware/auth");

router.post("/create", auth, upload.any("postimg"), postController.createPost);
router.put("/edit/:id", auth, upload.any("postimg"), postController.editPost);
router.post("/getall", auth, postController.getAllPost);
router.get("/getbypsotId/:id", auth, postController.getByPostId);
router.delete("/delete/:id", auth, postController.deletePost);
router.get("/likes/:id", auth, postController.toggleLike);

module.exports = router;
