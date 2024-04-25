// const ResponseHandler = require("../handlers/responsehandlers");
// const MSGConst = require("../constants/messageconstants");
const userModal = require("../models/userModal");
const { body, validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const { unlinkFiles } = require("../common/helper");
// const businessNameType = require("../models/businessNameType");
// const fetch = require("isomorphic-fetch");

class userController {
  constructor() {}

  // User Registration Controller.
  async register(req, res) {
    try {
      [
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
      ],
        (req, res) => {};
      // if (req.body.logo) {
      //     req.checkBody("logo", "Please add a logo image.").notEmpty();
      // }

      const errors = req.validationResult();

      if (errors) {
        console.log(errors);
        if (req.file) {
          unlinkFiles(req.file?.path);
        }
        return ResponseHandler.errorResponse(
          res,
          400,
          MSGConst.SOMETHING_WRONG,
          errors
        );
      }

      // if (!req.file) {
      //     return ResponseHandler.errorResponse(
      //         res,
      //         400,
      //         MSGConst.LOGO_MSG,
      //         []
      //     );
      // }

      // let filename = (await req.file) ? req.file?.filename : null;
      // const result = await userModal.register(req.body, filename);
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

      // if (result[0]?.phone == parseInt(req.body.phone)) {
      //     if (req.file) {
      //         unlinkFiles(req.file?.path);
      //     }
      //     return ResponseHandler.errorResponse(
      //         res,
      //         400,
      //         MSGConst.PHONE_EXISTS,
      //         []
      //     );
      // }

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
      await createTeam(req.body);
      await upsertUsers(req.body);
      ResponseHandler.successResponse(
        res,
        200,
        MSGConst.REGISTRATION_SUCCESS,
        []
      );
    } catch (e) {
      console.log(e);
      ResponseHandler.errorResponse(res, 400, MSGConst.SOMETHING_WRONG, []);
    }
  }

  // User Login Controller.
  async login(req, res) {
    try {
      req
        .checkBody("email")
        .notEmpty()
        .withMessage("Please enter email.")
        .isEmail()
        .withMessage("The Email Id you have entered is invalid.");
      req
        .checkBody("password")
        .notEmpty()
        .withMessage("Please enter password.")
        .isLength({ min: 8, max: 16 })
        .withMessage("The password must be 8 to 16 characters in length.");
      const errors = req.validationErrors();
      if (errors) {
        return ResponseHandler.errorResponse(
          res,
          400,
          MSGConst.SOMETHING_WRONG,
          errors
        );
      }
      const result = await userModal.login(req.body);

      if (result[0]?.status === "inactive") {
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
      result.chat_token = await generateTokan(result?.id);
      ResponseHandler.successResponse(res, 200, MSGConst.LOGIN_SUCCESS, result);
    } catch (e) {
      console.log(e);
      ResponseHandler.errorResponse(res, 400, MSGConst.SOMETHING_WRONG, []);
    }
  }

  // User Login Controller.
  async login_as(req, res) {
    try {
      const result = await userModal.login_as(req.params.id);

      if (result[0]?.status === "inactive") {
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
          MSGConst.USERNOTFOUND,
          []
        );
      }
      result.chat_token = await generateTokan(req.params.id);
      ResponseHandler.successResponse(res, 200, MSGConst.LOGIN_SUCCESS, result);
    } catch (e) {
      console.log(e);
      ResponseHandler.errorResponse(res, 400, MSGConst.SOMETHING_WRONG, []);
    }
  }

  // Super Admin Login Controller.
  async super_login(req, res) {
    try {
      req
        .checkBody("email")
        .notEmpty()
        .withMessage("Please enter email.")
        .isEmail()
        .withMessage("The Email Id you have entered is invalid.");
      req
        .checkBody("password")
        .notEmpty()
        .withMessage("Please enter password.")
        .isLength({ min: 8, max: 16 })
        .withMessage("The password must be 8 to 16 characters in length.");
      const errors = req.validationErrors();
      if (errors) {
        return ResponseHandler.errorResponse(
          res,
          400,
          MSGConst.SOMETHING_WRONG,
          errors
        );
      }
      const result = await userModal.super_login(req.body);

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
      ResponseHandler.errorResponse(res, 400, MSGConst.SOMETHING_WRONG, []);
    }
  }

  // Logout Controller all users.
  async logout(req, res) {
    try {
      const result = await userModal.logout(req.user);
      ResponseHandler.successResponse(res, 200, MSGConst.LOGOUT_SUCCESS, []);
    } catch (e) {
      console.log(e);
      ResponseHandler.errorResponse(res, 400, MSGConst.SOMETHING_WRONG, []);
    }
  }

  // User details controller to check login user data.
  async check(req, res) {
    console.log(req.ip);
    if (req.user) {
      var token = req.user.token;
      req.user = await UserModel.getUserFullDetails(req.user.id);
      req.user.chat_token = await generateTokan(req.user.id);

      // await upsertUsers(req.user);
      req.user.token = token;
      ResponseHandler.successResponse(res, 200, MSGConst.SUCCESS, req.user);
    } else {
      ResponseHandler.errorResponse(res, 400, MSGConst.LOGIN_FAIL, []);
    }
  }

  // Forgot Password Controller for user.
  async forgotPassword(req, res) {
    try {
      req
        .checkBody("email")
        .notEmpty()
        .withMessage("Please enter email.")
        .isEmail()
        .withMessage("The email you have entered is invalid.");

      const errors = req.validationErrors();

      if (errors) {
        return ResponseHandler.errorResponse(
          res,
          400,
          MSGConst.SOMETHING_WRONG,
          errors
        );
      }

      const result = await userModal.forgotPassword(req.body.email);

      if (result?.length === 0) {
        return ResponseHandler.errorResponse(
          res,
          400,
          MSGConst.EMAIL_NOT_EXISTS,
          errors
        );
      }
      ResponseHandler.successResponse(res, 200, MSGConst.EMAIL_SENT, result);
    } catch (e) {
      console.log(e);
      ResponseHandler.errorResponse(res, 400, MSGConst.SOMETHING_WRONG, []);
    }
  }
  // super admin forgot password
  async super_forgotPassword(req, res) {
    try {
      req
        .checkBody("email")
        .notEmpty()
        .withMessage("Please enter email.")
        .isEmail()
        .withMessage("The email you have entered is invalid.");

      const errors = req.validationErrors();

      if (errors) {
        return ResponseHandler.errorResponse(
          res,
          400,
          MSGConst.SOMETHING_WRONG,
          errors
        );
      }

      const result = await userModal.super_forgotPassword(req.body.email);

      if (result?.length === 0) {
        return ResponseHandler.errorResponse(
          res,
          400,
          MSGConst.EMAIL_NOT_EXISTS,
          errors
        );
      }
      ResponseHandler.successResponse(res, 200, MSGConst.EMAIL_SENT, result);
    } catch (e) {
      console.log(e);
      ResponseHandler.errorResponse(res, 400, MSGConst.SOMETHING_WRONG, []);
    }
  }
  // Reset Password Controller for user
  async resetPassword(req, res) {
    try {
      req
        .checkBody("newpassword")
        .notEmpty()
        .withMessage("Please enter new password.")
        .isLength({ min: 8, max: 16 })
        .withMessage("The password must be 8 to 16 characters in length");

      req
        .checkBody("confirmpassword")
        .notEmpty()
        .withMessage("Please enter confirm password.")
        .isLength({ min: 8, max: 16 })
        .withMessage("The password must be 8 to 16 characters in length");

      const errors = req.validationErrors();

      if (errors) {
        return ResponseHandler.errorResponse(
          res,
          400,
          MSGConst.SOMETHING_WRONG,
          errors
        );
      }

      if (req.body.newpassword !== req.body.confirmpassword) {
        return ResponseHandler.errorResponse(
          res,
          400,
          MSGConst.PASSWORD_MATCH,
          errors
        );
      }
      try {
        const token = req.params.token;
        const user = await jwt.verify(token, "user");
        const result = await userModal.resetPassword(user.id, req.body);

        if (result.length === 0) {
          return ResponseHandler.errorResponse(
            res,
            400,
            MSGConst.SOMETHING_WRONG,
            errors
          );
        }
        ResponseHandler.successResponse(res, 200, MSGConst.RESET_PASSWORD, []);
      } catch (errors) {
        console.log(errors);
        return ResponseHandler.errorResponse(
          res,
          400,
          MSGConst.LINK_EXPIRES,
          errors
        );
      }
    } catch (e) {
      console.log(e);
      ResponseHandler.errorResponse(res, 400, MSGConst.SOMETHING_WRONG, []);
    }
  }
  // Reset Password Controller for super admin
  async super_resetPassword(req, res) {
    try {
      req
        .checkBody("newpassword")
        .notEmpty()
        .withMessage("Please enter new password.")
        .isLength({ min: 8, max: 16 })
        .withMessage("The password must be 8 to 16 characters in length");

      req
        .checkBody("confirmpassword")
        .notEmpty()
        .withMessage("Please enter confirm password.")
        .isLength({ min: 8, max: 16 })
        .withMessage("The password must be 8 to 16 characters in length");

      const errors = req.validationErrors();

      if (errors) {
        return ResponseHandler.errorResponse(
          res,
          400,
          MSGConst.SOMETHING_WRONG,
          errors
        );
      }

      if (req.body.newpassword !== req.body.confirmpassword) {
        return ResponseHandler.errorResponse(
          res,
          400,
          MSGConst.PASSWORD_MATCH,
          errors
        );
      }
      try {
        const token = req.params.token;
        const user = await jwt.verify(token, "user");
        const result = await userModal.super_resetPassword(user.id, req.body);

        if (result.length === 0) {
          return ResponseHandler.errorResponse(
            res,
            400,
            MSGConst.SOMETHING_WRONG,
            errors
          );
        }
        ResponseHandler.successResponse(res, 200, MSGConst.RESET_PASSWORD, []);
      } catch (errors) {
        console.log(errors);
        return ResponseHandler.errorResponse(
          res,
          400,
          MSGConst.LINK_EXPIRES,
          errors
        );
      }
    } catch (e) {
      console.log(e);
      ResponseHandler.errorResponse(res, 400, MSGConst.SOMETHING_WRONG, []);
    }
  }

  // new flow register get business type
  async businessType(req, res) {
    try {
      const result = await businessNameType.businessType(req);

      if (!result) {
        return ResponseHandler.errorResponse(
          res,
          400,
          MSGConst.SOMETHING_WRONG,
          []
        );
      }
      if (result) {
        return ResponseHandler.successResponse(
          res,
          200,
          MSGConst.SUCCESS,
          result
        );
      }
    } catch (e) {
      console.log(e);
      ResponseHandler.errorResponse(res, 400, MSGConst.SOMETHING_WRONG, []);
    }
  }

  // new flow register get business type details
  async businessTypeDetails(req, res) {
    try {
      const result = await businessNameType.businessTypeDetails(req);

      if (!result) {
        return ResponseHandler.errorResponse(
          res,
          400,
          MSGConst.SOMETHING_WRONG,
          []
        );
      }
      if (result) {
        return ResponseHandler.successResponse(
          res,
          200,
          MSGConst.SUCCESS,
          result
        );
      }
    } catch (e) {
      console.log(e);
      ResponseHandler.errorResponse(res, 400, MSGConst.SOMETHING_WRONG, []);
    }
  }

  // new flow register
  async reccaptchaToken(req, res) {
    try {
      const { token } = req.body;

      const url = `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RE_CAPTCHA_SECRET_KEY}&response=${token}`;

      fetch(url, {
        method: "post",
      })
        .then((response) => response.json())
        .then((google_response) => {
          if (!google_response) {
            return ResponseHandler.errorResponse(
              res,
              400,
              MSGConst.SOMETHING_WRONG,
              []
            );
          }
          if (google_response) {
            return ResponseHandler.successResponse(
              res,
              200,
              MSGConst.SUCCESS,
              google_response
            );
          }
        });
    } catch (e) {
      console.log(e);
      ResponseHandler.errorResponse(res, 400, MSGConst.SOMETHING_WRONG, []);
    }
  }
}

module.exports = new userController();
