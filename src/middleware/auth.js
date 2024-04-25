const jwt = require("jsonwebtoken");
const db = require("../utils/connection");
const jwtSecrect = process.env.JWT_SECERT_KEY;

module.exports = (req, res, next) => {
  // Extract the token from the request headers
  const token = req.headers.authorization;

  // Check if token is present
  if (!token) {
    return res.status(401).json({ message: "Authorization header is missing" });
  }

  // Verify the token
  jwt.verify(token, jwtSecrect, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Invalid token" });
    }

    // Check if the user exists in the database
    db.query(
      "SELECT * FROM users WHERE id = ?",
      decoded.userId,
      (error, results) => {
        if (error) {
          return res.status(500).json({ message: "Database error" });
        }

        if (results.length === 0) {
          return res.status(401).json({ message: "User not found" });
        }

        // Attach user information to the request object
        req.user = results[0];
        next();
      }
    );
  });
};
