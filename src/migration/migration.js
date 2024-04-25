const AlterCreateUserTable = require("./AlterCreateUserTable");
const CreateMigrationTable = require("./CreateMigrationTable");
const CreateUserAndTokenTable = require("./CreateUserAndTokenTable");
const createUserTable = require("./createUserTable");

class Migrations {
  constructor() {}

  async migrate(req, res) {
    await CreateMigrationTable.create();
    await CreateUserAndTokenTable.create();
    await AlterCreateUserTable.alter();
    res.send(["Migrated"]);
  }
}

module.exports = new Migrations();
