class CreateFollowsTable {
  constructor() {}

  async create() {
    try {
      const [create, fields_create] = await connectPool.query(
        `CREATE TABLE IF NOT EXISTS follow (
            id INT AUTO_INCREMENT PRIMARY KEY,
            follower_id INT NOT NULL,
            following_id INT NOT NULL,
            FOREIGN KEY (follower_id) REFERENCES users(id),
            FOREIGN KEY (following_id) REFERENCES users(id),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE KEY unique_follow (follower_id, following_id)
        )`
      );

      console.log("likes follow created successfully");
    } catch (e) {
      console.error("Error creating follow table:", e);
    }
  }
}

module.exports = new CreateFollowsTable();
