class createUserTable {
  constructor() {}

  async create() {
    try {
      const [create, fields_create] = await connectPool.query(
        `CREATE TABLE IF NOT EXISTS users (
                id int NOT NULL AUTO_INCREMENT PRIMARY KEY,
                username varchar(255) DEFAULT NULL,
                email varchar(255) DEFAULT NULL,
                password varchar(255) DEFAULT NULL,
                phone bigint DEFAULT NULL,
                logo varchar(255) DEFAULT NULL,
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
