const bcriptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { getCurrentTime, unlinkFiles } = require("../common/helper");

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
          username: input.username?.trim(),
          email: input.email?.trim(),
          phone: number?.trim(),
          password: hashed_password,
          logo: filename,
          status: 1,
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
        [input.email?.trim()]
      );

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
            created_at: getCurrentTime(),
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
        [email?.trim()]
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

  async getUserFullDetails(id) {
    try {
      const [rows_user, fields] = await connectPool.query(
        `SELECT * from users WHERE id = ?`,
        [id]
      );
      return rows_user[0];
    } catch (e) {
      console.log(e);
      throw new Error(e);
    }
  }

  async getUserDetails(id) {
    try {
      // Query to get user details
      const [rows_user, fields_user] = await connectPool.query(
        `SELECT * FROM users WHERE id = ?`,
        [id]
      );

      if (rows_user.length === 0) {
        return null; // If user not found, return null
      }

      const user = rows_user[0];

      // Query to get count of users following the current user
      const [rows_followers_count] = await connectPool.query(
        `SELECT COUNT(*) AS followers_count FROM follow WHERE following_id = ?`,
        [id]
      );

      // Query to get count of users whom the current user follows
      const [rows_following_count] = await connectPool.query(
        `SELECT COUNT(*) AS following_count FROM follow WHERE follower_id = ?`,
        [id]
      );

      // Query to get details of users whom the current user follows
      const [rows_following, fields_following] = await connectPool.query(
        `SELECT u.id, u.username, u.logo 
        FROM users u 
        INNER JOIN follow f ON u.id = f.following_id 
        WHERE f.follower_id = ?`,
        [id]
      );

      // Query to get details of users who follow the current user
      const [rows_followers, fields_followers] = await connectPool.query(
        `SELECT u.id, u.username, u.logo 
        FROM users u 
        INNER JOIN follow f ON u.id = f.follower_id 
        WHERE f.following_id = ?`,
        [id]
      );

      return {
        user: user,
        followers: {
          count: rows_followers_count[0].followers_count,
          users: rows_followers,
        },
        following: {
          count: rows_following_count[0].following_count,
          users: rows_following,
        },
      };
    } catch (error) {
      throw error;
    }
  }

  async getAllUserDeta(input, user_id) {
    try {
      const offset = (input.pageNumber - 1) * input.pageSize;

      const [rows_users, fields] = await connectPool.query(
        `SELECT u.*, 
         CASE WHEN f.follower_id IS NOT NULL THEN 1 ELSE 0 END AS is_following
         FROM users u
         LEFT JOIN follow f ON u.id = f.following_id AND f.follower_id = ?
         WHERE u.id != ?
         LIMIT ? OFFSET ?`,
        [user_id, user_id, input.pageSize, offset]
      );

      const [rows_count] = await connectPool.query(
        `SELECT COUNT(*) AS total_count FROM users WHERE id != ?`,
        [user_id]
      );
      const totalCount = rows_count[0].total_count;

      return { users: rows_users, totalCount };
    } catch (e) {
      console.error("Error fetching users:", e);
      throw new Error("Error fetching users");
    }
  }

  async editProfile(id, input, filename) {
    try {
      const [rows_user, fields_user] = await connectPool.query(
        `SELECT * FROM users WHERE id = ? LIMIT 1`,
        [id]
      );

      if (rows_user.length === 1) {
        const [rows_update, fields_update] = await connectPool.query(
          `UPDATE users 
         SET 
           username = ?, 
           phone = ?, 
           logo = ?, 
           updated_at = ?
         WHERE id = ?`,
          [input.username, input.phone, filename, getCurrentTime(), id]
        );

        if (filename !== rows_user[0].logo) {
          await unlinkFiles(`${process.env.UPLOAD_DIR}/${rows_user[0].logo}`);
        }

        return rows_update;
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async changePassword(user, input) {
    try {
      const user_id = user.id;
      const [rows_user, fields] = await connectPool.query(
        `SELECT id, password from users WHERE id = ? LIMIT 1`,
        [user_id]
      );

      if (rows_user.length === 1) {
        const checkPassword = await bcriptjs.compare(
          input.currentPassword,
          rows_user[0].password
        );

        if (checkPassword) {
          const newpassword = await bcriptjs.hash(input.newPassword, 8);
          const [rows, fields] = await connectPool.query(
            `UPDATE users SET 
                password = ?,
                updated_at = ?              
                WHERE id = ?`,
            [newpassword, getCurrentTime(), user_id]
          );

          let data = { checkPassword };
          return data;
        } else {
          throw new Error("Current password is incorrect");
        }
      } else {
        throw new Error("User not found");
      }
    } catch (e) {
      console.error(e);
      throw new Error(e.message);
    }
  }

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
