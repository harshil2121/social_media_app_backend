class AlterCreateUserTable {
  constructor() {}

  async alter() {
    try {
      const migration_name = "AlterCreateUserTable";
      const [rows, fields] = await connectPool.query(
        "select id from migrations where name=?",
        [migration_name]
      );

      if (rows.length == 0) {
        const [alter, fields_alter] = await connectPool.query(
          `ALTER TABLE users
          ADD COLUMN status BOOLEAN NOT NULL DEFAULT TRUE AFTER username,
          ADD COLUMN is_delete BOOLEAN NOT NULL DEFAULT FALSE AFTER status;
          `
        );

        await connectPool.query(`INSERT INTO migrations SET ?`, {
          name: migration_name,
        });
      }
    } catch (e) {
      console.log(e);
    }
  }
}

module.exports = new AlterCreateUserTable();
