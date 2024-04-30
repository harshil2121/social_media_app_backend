const bcriptjs = require("bcryptjs");
const { getCurrentTime } = require("../common/helper");
class CreateUserAndTokenTable {
  constructor() {}

  async create() {
    try {
      const migration_name = "CreateUserAndTokenTable";
      const [rows, fields] = await connectPool.query(
        "select id from migrations where name=?",
        [migration_name]
      );

      if (rows.length == 0) {
        // const [create, fields_create] = await connectPool.query(
        //   `CREATE TABLE users (
        //     username varchar(255) DEFAULT NULL,
        //     email varchar(255) DEFAULT NULL,
        //     phone bigint DEFAULT NULL,
        //     address_line1 varchar(255) DEFAULT NULL,
        //     state varchar(255) DEFAULT NULL,
        //     city varchar(255) DEFAULT NULL,
        //     postal_code varchar(255) DEFAULT NULL,
        //     logo longblob DEFAULT NULL,
        //     status
        //     password varchar(255) DEFAULT NULL,
        //     created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        //     updated_at DATETIME on update CURRENT_TIMESTAMP NULL DEFAULT NULL
        //             )`
        // );
        // let hashed_password = await bcriptjs.hash("admin@123", 8);
        // let data = {
        //   username: "Super Admin",
        //   companyname: "Minbly",
        //   email: "superadmin@yopmail.com",
        //   brandcolor: "#FFFFFF",
        //   password: hashed_password,
        //   created_at: getCurrentTime(),
        //   updated_at: getCurrentTime(),
        //   role: "Super Admin",
        //   parent: 0,
        // };
        // const [rows, fields] = await connectPool.query(
        //   "INSERT INTO users set ? ",
        //   data
        // );

        const [create_token, fields_create_token] = await connectPool.query(
          `CREATE TABLE IF NOT EXISTS users_token (
                        id int NOT NULL AUTO_INCREMENT PRIMARY KEY,
                        user_id int DEFAULT NULL,
                        token varchar(255) DEFAULT NULL,
                        created_at DATETIME DEFAULT NULL
                    )`
        );

        const [insert_migration, fields_insert_migration] =
          await connectPool.query(`INSERT INTO migrations SET ?`, {
            name: migration_name,
          });
      }
    } catch (e) {
      console.log(e);
    }
  }
}

module.exports = new CreateUserAndTokenTable();
