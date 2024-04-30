class CreatePostTable {
  constructor() {}

  async create() {
    try {
      const [create, fields_create] = await connectPool.query(
        `CREATE TABLE IF NOT EXISTS posts (
          id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
          user_id INT DEFAULT NULL,
          description TEXT DEFAULT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME ON UPDATE CURRENT_TIMESTAMP,
          INDEX user_id_index (user_id),
          FOREIGN KEY (user_id) REFERENCES users(id)
        )`
      );
      console.log("Post table created successfully");
    } catch (e) {
      console.error("Error creating post table:", e);
    }
  }
}

module.exports = new CreatePostTable();
