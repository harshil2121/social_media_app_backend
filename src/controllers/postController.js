const { body, validationResult } = require("express-validator");
const postModal = require("../models/postModal");
const { unlinkFiles } = require("../common/helper");
const ResponseHandler = require("../common/responceHandler");
const MSGConst = require("../common/massageConstant");
const fs = require("fs");

class PostController {
  constructor() {}

  // Create Post Controller.
  async createPost(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        await deleteFiles(req.files.customer_files);
        return res.status(400).json({ errors: errors.array() });
      }

      let filenames = [];

      console.log(req.files.length, "gggg", req.files);

      const deleteFiles = async (data) => {
        let i = 0;
        for (i = 0; i < data.length; i++) {
          unlinkFiles(data[i]?.path);
        }
      };

      // Function to process customer documents and push them to filenames array
      const processCustomerDocs = async (data) => {
        const docs = [];
        for (let i = 0; i < data.length; i++) {
          docs.push({
            filename: data[i].path.split("uploads/posts").join(""),
            original_name: data[i].originalname,
          });
        }
        return docs;
      };

      // Check if customer files are uploaded
      if (req.files) {
        filenames.push(...(await processCustomerDocs(req.files)));
      }

      const result = await postModal.createPost(req.body, req.user, filenames);

      ResponseHandler.successResponse(res, 200, MSGConst.POST_SUCCESS, result);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  async editPost(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      let filenames = [];
      console.log("req.files", req.files);
      // Check if there are files in the request
      if (req.files && req.files.length > 0) {
        // If there are files, iterate over them and extract filenames
        filenames = req.files.map((file) => file.filename);
      } else if (req.body.postimg && Array.isArray(req.body.postimg)) {
        // If no files in the request, check if there are filenames in the body
        filenames = req.body.postimg.filter(
          (filename) => typeof filename === "string"
        );
      }

      // Check if there are any filenames
      if (filenames.length === 0) {
        return ResponseHandler.errorResponse(
          res,
          400,
          MSGConst.LOGO_MSG,
          "At least one image is required."
        );
      }

      // Check if the images already exist in the upload folder
      const existingImages = filenames.filter((filename) => {
        const imagePath = `./${process.env.UPLOAD_DIR}/${filename}`;
        return fs.existsSync(imagePath);
      });

      if (existingImages.length > 0) {
        return ResponseHandler.errorResponse(
          res,
          400,
          "Image already exists.",
          "One or more images with the same filename already exist in the upload folder."
        );
      }

      // Call your postModal.editPost function with the filenames
      const result = await postModal.editPost(
        req.params.id,
        req.body,
        filenames
      );

      ResponseHandler.successResponse(res, 200, MSGConst.POST_UPDATE, []);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  async getAllPost(req, res) {
    try {
      const result = await postModal.getAllPost(req.user.id, req.body);

      ResponseHandler.successResponse(res, 200, MSGConst.SUCCESS, result);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  async getByPostId(req, res) {
    try {
      const result = await postModal.getByPostId(req.params.id);

      ResponseHandler.successResponse(res, 200, MSGConst.SUCCESS, result);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  async deletePost(req, res) {
    try {
      const result = await postModal.deletePost(req.params.id);

      ResponseHandler.successResponse(res, 200, MSGConst.SUCCESS, result);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  async toggleLike(req, res) {
    try {
      const result = await postModal.toggleLike(
        Number(req.params.id),
        req.user.id
      );

      ResponseHandler.successResponse(res, 200, result.message, []);
    } catch (error) {
      return res.status(500).json({ error: "Internal server error" });
    }
  }
  // Define validation rules for createPost method
  static validate(method) {
    switch (method) {
      case "createPost": {
        return [
          body("description")
            .notEmpty()
            .withMessage("Please enter description."),
          // body("logo")
          //   .notEmpty()
          //   .withMessage("Please upload photo.")
          //   .isString(),
        ];
      }
      case "editPost": {
        return [
          body("description")
            .notEmpty()
            .withMessage("Please enter description."),
          // body("logo")
          //   .notEmpty()
          //   .withMessage("Please upload photo.")
          //   .isString(),
        ];
      }
      default:
        return [];
    }
  }
}

module.exports = new PostController();
