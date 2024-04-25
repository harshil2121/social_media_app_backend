const bcriptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { getCurrentTime } = require("../common/helper");
// const RunUserMigration = require("../migrations/RunUserMigration");

class userModal {
  constructor() {}

  async register(input, filename) {
    try {
      console.log("imput", input);

      const [rows_user, fields] = await connectPool.query(
        "SELECT email,username FROM users WHERE email = ? LIMIT 1",
        [input.email]
      );

      if (rows_user.length === 0) {
        let hashed_password = await bcriptjs.hash(input.password, 8);
        let number =
          (await input.phone.length) === 9 ? "0" + input.phone : input.phone;

        let data = {
          username: input.username.trim(),
          email: input.email.trim(),
          phone: number.trim(),
          password: hashed_password,
          logo: filename,
          address_line1: input?.address_line1.trim(),
          state: input?.state.trim(),
          city: input?.city.trim(),
          postal_code: input?.postal_code.trim(),
          created_at: getCurrentTime(),
          updated_at: getCurrentTime(),
        };
        const [rows, fields] = await connectPool.query(
          "INSERT INTO users set ? ",
          data
        );
        // await this.update_prefix(rows.insertId);

        // let subject = "Registration Successful";
        // let msg = await RegisterEmailTemplate.MailSent({
        //   username: data.username,
        // });

        // let result = await EmailHandler.sendEmail(
        //   input.email,
        //   msg,
        //   subject,
        //   "",
        //   getLogo()
        // );
        if (data) {
          return data;
        }
        return rows;
      }
      return rows_user;
    } catch (e) {
      throw new Error(e);
    }
  }

  async login(input) {
    try {
      const [rows_user, fields] = await connectPool.query(
        "SELECT * FROM users WHERE email = ? LIMIT 1",
        [input.email.trim()]
      );
      console.log(rows_user, "frfrfrf");
      if (
        rows_user.length > 0 &&
        rows_user[0]?.status === 1 &&
        rows_user[0]?.is_delete === 0
      ) {
        let user = rows_user[0];
        const password = user.password;
        const isMatch = await bcriptjs.compare(input.password, password);
        if (!isMatch) {
          return [];
        }
        const token = await jwt.sign({ id: user.id }, "users");

        const [row_token, fields] = await connectPool.query(
          "INSERT INTO users_token SET ?",
          {
            user_id: user.id,
            token: token,
          }
        );
        // user = await UserModel.getUserFullDetails(user.id);
        user.token = token;

        // await RunUserMigration.runuserMigration(user.table_prefix);

        return user;
      }
      return rows_user;
    } catch (e) {
      console.log(e);
      throw Error(e);
    }
  }

  // async login_as(id) {
  //   try {
  //     const [rows_user, fields] = await connectPool.query(
  //       "SELECT * FROM users WHERE id = ?  AND role != 'Super Admin' LIMIT 1",
  //       [id]
  //     );
  //     // console.log(rows_user);
  //     if (
  //       rows_user.length > 0 &&
  //       rows_user[0]?.status === "active" &&
  //       rows_user[0].is_delete === 0
  //     ) {
  //       let user = rows_user[0];
  //       const token = await jwt.sign({ id: user.id }, "users");
  //       const [row_token, fields] = await connectPool.query(
  //         "INSERT INTO users_token SET ?",
  //         {
  //           user_id: user.id,
  //           token: token,
  //         }
  //       );

  //       user = await UserModel.getUserFullDetails(user.id);
  //       user.token = token;
  //       return user;
  //     }
  //     return [];
  //   } catch (e) {
  //     console.log(e);
  //     throw Error(e);
  //   }
  // }

  // async super_login(input) {
  //   try {
  //     const [rows_user, fields] = await connectPool.query(
  //       "SELECT * FROM users WHERE email = ? AND role = 'Super Admin' LIMIT 1",
  //       [input.email]
  //     );

  //     if (rows_user.length > 0) {
  //       let user = rows_user[0];
  //       const password = user.password;
  //       const isMatch = await bcriptjs.compare(input.password, password);

  //       if (!isMatch) {
  //         return [];
  //       }
  //       const token = await jwt.sign({ id: user.id }, "users");
  //       const [row_token, fields] = await connectPool.query(
  //         "INSERT INTO users_token SET ?",
  //         {
  //           user_id: user.id,
  //           token: token,
  //         }
  //       );

  //       user.token = token;

  //       return user;
  //     }
  //     return [];
  //   } catch (e) {
  //     console.log(e);
  //     throw Error(e);
  //   }
  // }
  async logout(input) {
    try {
      const [rows_user, fields] = await connectPool.query(
        "DELETE FROM users_token WHERE user_id = ? AND token = ?",
        [input.id, input.token]
      );
      return rows_user;
    } catch (e) {
      throw Error(e);
    }
  }

  async forgotPassword(email) {
    try {
      const [rows_user, fields] = await connectPool.query(
        `SELECT email,id,username from users WHERE email = ? LIMIT 1`,
        [email.trim()]
      );

      if (rows_user.length === 1) {
        let token = jwt.sign({ id: rows_user[0].id }, "user", {
          expiresIn: "1d",
        });
        let resetLink = `${process.env.domainURL}/resetPassword/${token}`;
        let subject = "Reset Password Link";
        let msg = await ResetPasswordTemplate.MailSent({
          username: rows_user[0].username,
          resetLink,
        });

        let result = await EmailHandler.sendEmail(
          rows_user[0].email,
          msg,
          subject,
          "",
          getLogo()
        );
        return result;
      }
      return rows_user;
    } catch (e) {
      throw new Error(e);
    }
  }

  async resetPassword(id, input) {
    try {
      // console.log(id, input);
      const [rows_user, fields] = await connectPool.query(
        `SELECT id from users WHERE id = ? AND role != 'Super Admin' LIMIT 1`,
        [id]
      );

      if (rows_user.length === 1) {
        let newpassword = await bcriptjs.hash(input.newpassword, 8);
        const [rows, fields] = await connectPool.query(
          `UPDATE users SET 
                        password = '${newpassword}',
                        updated_at = '${getCurrentTime()}'              
                        WHERE users.id = ? `,
          [rows_user[0].id]
        );
        return rows;
      }
      return rows_user;
    } catch (e) {
      throw new Error(e);
    }
  }

  // Fetching all the user details.
  async getUserFullDetails(id) {
    try {
      const [rows_user, fields] = await connectPool.query(
        `SELECT * from users WHERE id = ?`,
        [id]
      );

      if (
        rows_user.length > 0 &&
        rows_user[0]?.proctivity_connected_account_id !== null
      ) {
        const [data_Finishsetup, fields_data_Finishsetup] =
          await connectPool.query(
            `SELECT a.*, b.setup_module_name FROM finishSetup_by_user AS a LEFT JOIN finishSetupDataModel AS b ON a.finish_setup_id = b.id WHERE 
                                b.setup_module_name = 'Connect to stripe' AND a.user_id = ?`,
            [id]
          );

        const [update_Finishsetup, fields_Finishsetup] =
          await connectPool.query(
            `  UPDATE finishSetup_by_user 
                          SET 
                          isSetupComplete = 1
                          WHERE id = ? AND user_id = ?`,
            [data_Finishsetup[0]?.id, id]
          );
      }

      if (rows_user.length > 0) {
        let user = rows_user[0];
        user.logoPath = `${process.env.UPLOAD_DIR}/${user.logo}`;

        if (user.parent === 0) {
          if (user.id !== 1) {
            user.package = await this.packageinfo(user.id);
          }
        } else {
          let new_user = await this.getUserDetails(user.parent);
          new_user.username = user.username;
          new_user.email = user.email;
          new_user.phone = user.phone;
          new_user.role = user.role;
          new_user.id = user.id;
          new_user.parent = user.parent;
          new_user.created_at = user.created_at;
          new_user.updated_at = user.updated_at;
          new_user.password = user.password;
          new_user.access_key_send = user.access_key_send;
          new_user.logoPath = `${process.env.UPLOAD_DIR}/${new_user.logo}`;
          new_user.package = await this.packageinfo(user.parent);
          user = new_user;
        }
        if (user.id !== 1) {
          user.permissions = await this.GetUserPermissionsOnly({
            table_prefix: user.table_prefix,
            user_id: user.id,
          });
        }

        const table_prefix = user.table_prefix;
        if (table_prefix !== null) {
          const [check_n, fields1] = await connectPool.query(
            `SELECT * from ${table_prefix}notifications WHERE n_type = "free_trial_ended"`
          );

          if (check_n.length === 0) {
            if (
              user.package?.package_type === "Trial" &&
              user.package?.expired === true
            ) {
              const [update_add_free_trial, field] = await connectPool.query(
                `UPDATE users SET is_request = 0 WHERE id = ?`,
                [user.id]
              );
            }
          }
        }

        return user;
      }

      return rows_user;
    } catch (e) {
      console.log(e);
      throw new Error(e);
    }
  }

  // Fetching single User details by its id.
  async getUserDetails(id) {
    try {
      const [rows_user, fields] = await connectPool.query(
        `SELECT * from users WHERE id = ?`,
        [id]
      );

      if (rows_user.length > 0) {
        const user = rows_user[0];
        return user;
      }
      return rows_user;
    } catch (e) {
      console.log(e);
      throw new Error(e);
    }
  }

  // Update user profile by user id.
  async editProfile(id, input, filename) {
    try {
      const [rows_user, fields] = await connectPool.query(
        `SELECT id,phone,logo FROM users WHERE id = ? LIMIT 1`,
        [id]
      );

      if (rows_user.length === 1) {
        const [checkPhone, checkPhoneFields] = await connectPool.query(
          `SELECT id, phone from users WHERE phone = ? LIMIT 1`,
          [input.phone]
        );
        // if (
        //     checkPhone.length === 0 ||
        //     (checkPhone.length === 1 &&
        //         checkPhone[0].id === rows_user[0].id)
        // ) {
        let number =
          (await input.phone.length) === 9 ? "0" + input.phone : input.phone;
        const [rows, fields] = await connectPool.query(
          `UPDATE users SET 
                          
                          username = '${input.username}', 
                          companyname = '${input.companyname}', 
                          phone = '${number}', 
                          brandcolor = '${input.brandcolor}',
                          logo = '${filename}',
                          updated_at = '${getCurrentTime()}',
                          address_line1 = '${input.address_line1}',
                          address_line2 = '${input.address_line2}',
                          postal_code = '${input.postal_code}',
                          city = '${input.city}',
                          state = '${input.state}'
                          WHERE users.id = ?`,
          [id]
        );

        if (filename !== rows_user[0].logo) {
          await unlinkFiles(`${process.env.UPLOAD_DIR}/${rows_user[0].logo}`);
        }
        input.id = id;
        input.parent = rows_user[0].parent;
        await upsertUsers(input);
        const [user, fields_user] = await connectPool.query(
          `SELECT id,phone,logo,address_line1 FROM users WHERE id = ?`,
          [id]
        );

        if (user[0]?.phone && user[0]?.address_line1) {
          const [data_Finishsetup, fields_data_Finishsetup] =
            await connectPool.query(
              `SELECT a.*, b.setup_module_name FROM finishSetup_by_user AS a LEFT JOIN finishSetupDataModel AS b ON a.finish_setup_id = b.id WHERE 
                                  b.setup_module_name = 'Update your profile' AND a.user_id = ?`,
              [id]
            );

          const [update_Finishsetup, fields_Finishsetup] =
            await connectPool.query(
              `  UPDATE finishSetup_by_user 
                            SET 
                            isSetupComplete = 1
                            WHERE id = ? AND user_id = ?`,
              [data_Finishsetup[0]?.id, id]
            );
          console.log("data_Finishsetup[0]?.id", data_Finishsetup[0]?.id, id);
        }
        return rows;
        // }
        // return checkPhone;
      }

      // return rows_user;
    } catch (e) {
      console.log(e);
      throw new Error(e);
    }
  }

  // Update user password by user id.
  async changePassword(id, input) {
    try {
      const [rows_user, fields] = await connectPool.query(
        `SELECT id,access_key_send, password from users WHERE id = ? LIMIT 1`,
        [id]
      );
      if (rows_user.length === 1) {
        const sql_update = rows_user[0].access_key_send
          ? "access_key_send = 0,"
          : "";
        const checkPassword = await bcrypt.compare(
          input.currentpassword,
          rows_user[0].password
        );

        if (checkPassword) {
          const newpassword = await bcrypt.hash(input.newpassword, 8);
          const [rows, fields] = await connectPool.query(
            `UPDATE users SET 
                password = '${newpassword}',
                ${sql_update} 
                updated_at = '${getCurrentTime()}'              
                WHERE users.id = ?`,
            [id]
          );
        }
        let data = { checkPassword };
        return data;
      }
      return rows_user;
    } catch (e) {
      console.log(e);
      throw new Error(e);
    }
  }

  // Update Subuser active/deactive status.
  async updateUserStatus(req) {
    try {
      let input = req.body;
      const [rows_users, fields] = await connectPool.query(
        `SELECT id,username,email,status from users WHERE id = ?`,
        [input.id]
      );

      if (rows_users.length !== 0) {
        const [update_user_status] = await connectPool.query(
          `UPDATE users SET status = ?, updated_at = ? WHERE id = ?`,
          [input.status, getCurrentTime(), input.id]
        );

        if (update_user_status) {
          let subject =
            input.status === "inactive"
              ? "Account Deactivated"
              : "Account Activated";

          let account_status =
            input.status === "inactive" ? "deactivated" : "activated";

          const msg = await SubUserAccountStatusEmailTemplate.MailSent({
            username: rows_users[0].username,
            account_status: account_status,
          });

          let result = await emailhandler.sendEmail(
            rows_users[0].email,
            msg,
            subject,
            "",
            getLogo()
          );
          const [delete_user_token, delete_fields] = await connectPool.query(
            "DELETE FROM users_token WHERE user_id = ?",
            [input.id]
          );

          return update_user_status;
        }
      }

      return rows_users;
    } catch (e) {
      console.log(e);
      throw new Error(e);
    }
  }
}

module.exports = new userModal();
