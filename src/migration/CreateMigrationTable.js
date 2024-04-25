class CreateMigrationTable {
  constructor() {}

  async create() {
    try {
      const [create, fields_create] = await connectPool.query(
        `CREATE TABLE IF NOT EXISTS migrations (
                          id int NOT NULL AUTO_INCREMENT PRIMARY KEY,
                          name varchar(255) DEFAULT NULL
                      )`
      );
    } catch (e) {
      console.log(e);
    }
  }
}

module.exports = new CreateMigrationTable();
