const { body, validationResult } = require("express-validator");
const userModal = require("../models/userModal");
const jwt = require("jsonwebtoken");
const { unlinkFiles } = require("../common/helper");
const ResponseHandler = require("../common/responceHandler");
const MSGConst = require("../common/massageConstant");

class userController {
  constructor() {}

  async register(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const result = await userModal.register(req.body);

      if (result[0]?.email === req.body.email) {
        if (req.file) {
          unlinkFiles(req.file?.path);
        }
        return ResponseHandler.errorResponse(
          res,
          400,
          MSGConst.EMAIL_EXISTS,
          []
        );
      }

      if (!result) {
        if (req.file) {
          unlinkFiles(req.file?.path);
        }
        return ResponseHandler.errorResponse(
          res,
          400,
          MSGConst.SOMETHING_WRONG,
          []
        );
      }

      req.body.id = result.insertId;
      // await upsertUsers(req.body);
      ResponseHandler.successResponse(
        res,
        200,
        MSGConst.REGISTRATION_SUCCESS,
        []
      );
    } catch (e) {
      console.log(e);
      return res.status(400).json({ error: "Something went wrong" });
    }
  }

  async login(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const result = await userModal.login(req.body);

      if (result[0]?.status === 0) {
        return ResponseHandler.errorResponse(
          res,
          400,
          MSGConst.SUB_USER_DEACTIVATED,
          []
        );
      }
      if (result[0]?.is_delete === 1) {
        return ResponseHandler.errorResponse(
          res,
          400,
          MSGConst.SUB_USER_DEACTIVATED,
          []
        );
      }
      if (result.length == 0) {
        return ResponseHandler.errorResponse(
          res,
          400,
          MSGConst.LOGIN_FAILED,
          []
        );
      }

      ResponseHandler.successResponse(res, 200, MSGConst.LOGIN_SUCCESS, result);
    } catch (e) {
      console.log(e);
      return res.status(400).json({ error: "Something went wrong" });
    }
  }

  async logout(req, res) {
    try {
      const result = await userModal.logout(req.user);
      ResponseHandler.successResponse(res, 200, MSGConst.LOGOUT_SUCCESS, []);
    } catch (e) {
      console.log(e);
      ResponseHandler.errorResponse(res, 400, MSGConst.SOMETHING_WRONG, []);
    }
  }

  async check(req, res) {
    if (req.user) {
      var token = req.user.token;

      req.user = await userModal.getUserFullDetails(req.user.id);

      req.user.token = token;
      ResponseHandler.successResponse(res, 200, MSGConst.SUCCESS, req.user);
    } else {
      ResponseHandler.errorResponse(res, 400, MSGConst.LOGIN_FAIL, []);
    }
  }

  async getUserDetails(req, res) {
    try {
      const result = await userModal.getUserDetails(req.params.id);

      ResponseHandler.successResponse(res, 200, MSGConst.SUCCESS, result);
    } catch (e) {
      console.log(e);
      return res.status(400).json({ error: "Something went wrong" });
    }
  }

  async getAllUserDeta(req, res) {
    try {
      const result = await userModal.getAllUserDeta(req.body, req.user.id);

      ResponseHandler.successResponse(res, 200, MSGConst.SUCCESS, result);
    } catch (e) {
      console.log(e);
      return res.status(400).json({ error: "Something went wrong" });
    }
  }

  async editUser(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      let filename = (await req.file) ? req.file?.filename : req.body.logo[1];

      const result = await userModal.editProfile(
        req.params.id,
        req.body,
        filename
      );

      if (result[0]?.email === req.body.email) {
        if (req.file) {
          unlinkFiles(req.file?.path);
        }
        return ResponseHandler.errorResponse(
          res,
          400,
          MSGConst.EMAIL_EXISTS,
          []
        );
      }

      if (!result) {
        if (req.file) {
          unlinkFiles(req.file?.path);
        }
        return ResponseHandler.errorResponse(
          res,
          400,
          MSGConst.SOMETHING_WRONG,
          []
        );
      }

      ResponseHandler.successResponse(res, 200, MSGConst.USER_UPDATED, {
        logo: filename,
      });
    } catch (e) {
      console.log(e);
      return res.status(400).json({ error: "Something went wrong" });
    }
  }

  async changePassword(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      if (req.body.newPassword !== req.body.confirmPassword) {
        return ResponseHandler.errorResponse(res, 400, MSGConst.PASSWORD_MATCH);
      }

      const result = await userModal.changePassword(req.user, req.body);

      if (result.checkPassword === false) {
        return ResponseHandler.errorResponse(res, 400, MSGConst.OLD_PASSWORD);
      }

      if (!result) {
        return ResponseHandler.errorResponse(
          res,
          400,
          MSGConst.SOMETHING_WRONG
        );
      }

      ResponseHandler.successResponse(res, 200, MSGConst.CHANGE_PASSWORD);
    } catch (e) {
      ResponseHandler.errorResponse(res, 500, MSGConst.SOMETHING_WRONG);
    }
  }
  // Define your validation rules here
  static validate(method) {
    switch (method) {
      case "register": {
        return [
          body("username")
            .notEmpty()
            .withMessage("Please enter username.")
            .matches(/^[a-zA-Z][a-zA-Z0-9 ]*$/)
            .withMessage("Please enter a valid username.")
            .isLength({ max: 20 })
            .withMessage("Username should not be more than 20 Characters."),
          body("email")
            .notEmpty()
            .withMessage("Please enter email.")
            .isEmail()
            .withMessage("The email you have entered is invalid")
            .isLength({ max: 60 })
            .withMessage("Email id should not be more than 60 Characters."),
          body("phone")
            .notEmpty()
            .withMessage("Please enter mobile number.")
            .matches(/^[0-9]+$/)
            .withMessage("Please enter a valid mobile number.")
            .isLength({ min: 10, max: 10 })
            .withMessage("Please enter a valid mobile number."),
          body("password")
            .notEmpty()
            .withMessage("Please enter password.")
            .isLength({ min: 8, max: 16 })
            .withMessage("The password must be 8 to 16 characters in length."),
        ];
      }
      case "login": {
        return [
          body("email")
            .notEmpty()
            .withMessage("Please enter email.")
            .isEmail()
            .withMessage("The Email Id you have entered is invalid."),
          body("password")
            .notEmpty()
            .withMessage("Please enter password.")
            .isLength({ min: 8, max: 16 })
            .withMessage("The password must be 8 to 16 characters in length."),
        ];
      }
      case "changePassword": {
        return [
          body("currentPassword")
            .notEmpty()
            .withMessage("Please enter current password.")
            .isLength({ min: 8, max: 16 })
            .withMessage("The password must be 8 to 16 characters in length."),
          body("newPassword")
            .notEmpty()
            .withMessage("Please enter new password.")
            .isLength({ min: 8, max: 16 })
            .withMessage("The password must be 8 to 16 characters in length."),
          body("confirmPassword")
            .notEmpty()
            .withMessage("Please enter confirm password.")
            .isLength({ min: 8, max: 16 })
            .withMessage("The password must be 8 to 16 characters in length."),
        ];
      }
      // Add validation rules for other methods if needed
      default:
        return [];
    }
  }
}

module.exports = new userController();
