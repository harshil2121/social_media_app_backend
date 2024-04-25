var express = require("express");
var router = express.Router();
``;
var Migrations = require("../migration/migration");

router.get("/migrations/create", Migrations.migrate);

module.exports = router;
