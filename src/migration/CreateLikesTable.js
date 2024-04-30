class CreatePostLikesTable {
  constructor() {}

  async create() {
    try {
      const [create, fields_create] = await connectPool.query(
        `CREATE TABLE IF NOT EXISTS likes (
          id INT AUTO_INCREMENT PRIMARY KEY,
          post_id INT,
          user_id INT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          UNIQUE KEY unique_like (post_id, user_id)
      )`
      );
      console.log("likes table created successfully");
    } catch (e) {
      console.error("Error creating post table:", e);
    }
  }
}

module.exports = new CreatePostLikesTable();
