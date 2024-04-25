const { getCurrentTime } = require("../common/helper");
class createUserTable {
  constructor() {}

  async create() {
    try {
      // const migration_name = "createUserTable";
      // const [rows, fields] = await connectPool.query(
      //   "select id from migrations where name=?",
      //   [migration_name]
      // );

      // if (rows.length == 0) {
      const [create, fields_create] = await connectPool.query(
        `CREATE TABLE users (
                id int NOT NULL AUTO_INCREMENT PRIMARY KEY,
                username varchar(255) DEFAULT NULL,
                email varchar(255) DEFAULT NULL,
                phone bigint DEFAULT NULL,
                address_line1 varchar(255) DEFAULT NULL,
                state varchar(255) DEFAULT NULL,
                city varchar(255) DEFAULT NULL,
                postal_code varchar(255) DEFAULT NULL,
                logo longblob DEFAULT NULL,
                password varchar(255) DEFAULT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME on update CURRENT_TIMESTAMP NULL DEFAULT NULL
            )`
      );

      // const [insert_migration, fields_insert_migration] =
      //   await connectPool.query(`INSERT INTO migrations SET ?`, {
      //     name: migration_name,
      //   });
      // }
    } catch (e) {
      console.log(e);
    }
  }
}

module.exports = new createUserTable();
