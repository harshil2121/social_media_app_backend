const AlterCreateUserTable = require("./AlterCreateUserTable");
const CreateFollowsTable = require("./CreateFollowsTable");
const CreateLikesTable = require("./CreateLikesTable");
const CreateMigrationTable = require("./CreateMigrationTable");
const CreatePostFilesTable = require("./CreatePostFilesTable");
const CreatePostTable = require("./CreatePostTable");
const CreateUserAndTokenTable = require("./CreateUserAndTokenTable");
const createUserTable = require("./createUserTable");

class Migrations {
  constructor() {}

  async migrate(req, res) {
    await createUserTable.create();
    await CreateMigrationTable.create();
    await CreateUserAndTokenTable.create();
    await AlterCreateUserTable.alter();
    await CreatePostTable.create();
    await CreatePostFilesTable.create();
    await CreateLikesTable.create();
    await CreateFollowsTable.create();
    res.send(["Migrated"]);
  }
}

module.exports = new Migrations();
