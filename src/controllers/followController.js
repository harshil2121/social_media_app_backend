const { body, validationResult } = require("express-validator");
const followModal = require("../models/followModal");
const ResponseHandler = require("../common/responceHandler");
const MSGConst = require("../common/massageConstant");

class FollowController {
  constructor() {}

  // Create Post Controller.
  async followUser(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        await deleteFiles(req.files.customer_files);
        return res.status(400).json({ errors: errors.array() });
      }

      const result = await followModal.followUser(req.params.id, req.user.id);

      ResponseHandler.successResponse(res, 200, MSGConst.POST_SUCCESS, result);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  async unfollowUser(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        await deleteFiles(req.files.customer_files);
        return res.status(400).json({ errors: errors.array() });
      }

      const result = await followModal.unfollowUser(req.params.id, req.user.id);

      ResponseHandler.successResponse(res, 200, MSGConst.POST_SUCCESS, result);
    } catch (error) {
      console.error(error);
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

      default:
        return [];
    }
  }
}

module.exports = new FollowController();
