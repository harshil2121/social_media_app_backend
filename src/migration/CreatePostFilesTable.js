class CreatePostFilesTable {
  constructor() {}

  async create() {
    try {
      const [create, fields_create] = await connectPool.query(
        `CREATE TABLE IF NOT EXISTS post_files (
          id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
          post_id INT DEFAULT NULL,
          filename VARCHAR(255) DEFAULT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME ON UPDATE CURRENT_TIMESTAMP,
          INDEX post_id_index (post_id),
          FOREIGN KEY (post_id) REFERENCES posts(id)
        )`
      );
      console.log("Postfiles table created successfully");
    } catch (e) {
      console.error("Error creating post table:", e);
    }
  }
}

module.exports = new CreatePostFilesTable();
