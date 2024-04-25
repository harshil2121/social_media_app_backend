const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();
// const path = require("path");
global.connectPool = require("./src/utils/connection");
const app = express();
const port = process.env.PORT;

app.use(bodyParser.json());
app.use(cors());

// Routes Paths
const UserRoutes = require("./src/routes/userRoutes");
const MigrationRoutes = require("./src/routes/migrationRoutes");

// Routes
app.use("/api/users", UserRoutes);
app.use("/api", MigrationRoutes);

app.use("/uploads", express.static(__dirname.replace("/src", "") + "/uploads"));

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});
// app.use("/", express.static(__dirname.replace("/src", "") + "/Public"));

// app.get("*", (req, res) => {
//   res.sendFile(path.join(__dirname.replace("/src", ""), "Public/index.html"));
// });

app.listen(port, () => console.log(`Server running on port ${port}`));
