const path = require("path");
const fs = require("fs");
const { getCurrentTime, unlinkFiles } = require("../common/helper");

class PostModal {
  constructor() {}

  async createPost(input, user, filenames) {
    try {
      // Insert post data into the 'posts' table
      let postData = {
        user_id: user.id,
        description:
          input?.description !== "" ? input?.description?.trim() : null,
        created_at: getCurrentTime(),
        updated_at: getCurrentTime(),
      };

      const [postRows, postFields] = await connectPool.query(
        "INSERT INTO posts SET ?",
        postData
      );

      // Retrieve the ID of the newly inserted post
      const postId = postRows.insertId;

      console.log("filenames<<<<", filenames);
      // Insert filenames into the new table for storing images/videos
      if (filenames?.length > 0) {
        const fileInsertPromises = filenames?.map(async (filename) => {
          const fileData = {
            post_id: postId,
            filename: filename.filename.split("\\").pop(),
            // Add other relevant fields if needed
          };
          console.log("fileData", fileData);
          return connectPool.query("INSERT INTO post_files SET ?", fileData);
        });
        await Promise.all(fileInsertPromises);
      }

      return postData;
    } catch (error) {
      throw error;
    }
  }

  async editPost(postId, input, filenames) {
    try {
      let postData = {
        description:
          input?.description !== "" ? input?.description?.trim() : null,
        updated_at: getCurrentTime(),
      };

      // Update existing post
      await connectPool.query(`UPDATE posts SET ? WHERE id = ?`, [
        postData,
        postId,
      ]);

      // Handle associated files in post_files table
      await this.handlePostFiles(postId, filenames);

      return true; // Indicate success
    } catch (error) {
      throw error;
    }
  }

  async handlePostFiles(postId, filenames) {
    try {
      // Fetch existing post files
      const [existingFilesRows] = await connectPool.query(
        `SELECT * FROM post_files WHERE post_id = ?`,
        [postId]
      );

      // Extract existing filenames
      const existingFilenames = existingFilesRows.map((row) => row.filename);

      // Remove files not present in the new filenames array
      const filesToRemove = existingFilenames.filter(
        (filename) => !filenames.includes(filename)
      );
      for (const filename of filesToRemove) {
        await unlinkFiles(`${process.env.UPLOAD_POST_DIR}/${filename}`);
        await connectPool.query(
          `DELETE FROM post_files WHERE post_id = ? AND filename = ?`,
          [postId, filename]
        );
      }

      // Add new files
      const newFilenames = filenames.filter(
        (filename) => !existingFilenames.includes(filename)
      );
      const fileInsertPromises = newFilenames.map(async (filename) => {
        const fileData = {
          post_id: postId,
          filename: filename,
          // Add other relevant fields if needed
        };
        return connectPool.query("INSERT INTO post_files SET ?", fileData);
      });

      await Promise.all(fileInsertPromises);
    } catch (error) {
      throw error;
    }
  }

  async getAllPost(user_id, input) {
    try {
      // Ensure input.pageNumber and input.pageSize are converted to numbers
      const pageNumber = Number(input.pageNumber);
      const pageSize = Number(input.pageSize);

      // Calculate offset for pagination
      const offset = (pageNumber - 1) * pageSize;

      const sqlQuery = `
            SELECT 
                posts.*, 
                post_files.filename AS image_filename, 
                users.username AS author_name, 
                users.logo AS author_img, 
                like_counts.like_count,
                GROUP_CONCAT(likes.user_id) AS liked_user_ids -- Concatenate all user IDs who have liked the post
            FROM 
                posts 
            LEFT JOIN 
                post_files ON post_files.post_id = posts.id 
            LEFT JOIN 
                users ON users.id = posts.user_id 
            LEFT JOIN 
                (SELECT post_id, COUNT(*) AS like_count FROM likes GROUP BY post_id) AS like_counts ON like_counts.post_id = posts.id
            LEFT JOIN 
                likes ON likes.post_id = posts.id
            GROUP BY 
                posts.id 
            ORDER BY 
                posts.created_at DESC
            LIMIT ?, ?;
        `;

      // Execute the main query to fetch paginated data
      const [rows, postFields] = await connectPool.query(sqlQuery, [
        offset,
        pageSize,
      ]);

      // Return the fetched posts
      return { posts: rows };
    } catch (error) {
      throw error;
    }
  }

  async getByPostId(id) {
    try {
      const [rows, fields] = await connectPool.query(
        `SELECT * from posts WHERE id = ?`,
        [id]
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  async deletePost(id) {
    try {
      // Fetch filenames associated with the post
      const [fileRows] = await connectPool.query(
        "SELECT filename FROM post_files WHERE post_id = ?",
        [id]
      );

      // Delete files from the uploads folder
      const uploadDir = process.env.UPLOAD_POST_DIR;
      for (const row of fileRows) {
        const filePath = path.join(
          uploadDir.toString(),
          row.filename.toString()
        ); // Ensure both arguments are strings
        if (fs.existsSync(filePath)) {
          await fs.promises.unlink(filePath);
        }
      }

      // Delete associated files from the post_files table
      const [rows_post_files, fields] = await connectPool.query(
        "DELETE FROM post_files WHERE post_id = ?",
        [id]
      );

      // Delete post from the posts table
      const [rows_posts, fields1] = await connectPool.query(
        "DELETE FROM posts WHERE id = ?",
        [id]
      );

      // Delete likes associated with the post from the likes table
      const [rows_likes, fields2] = await connectPool.query(
        "DELETE FROM likes WHERE post_id = ?",
        [id]
      );

      return true; // Indicate success
    } catch (error) {
      throw error;
    }
  }

  async toggleLike(postId, userId) {
    try {
      console.log("postId", postId);
      console.log("userId", userId);
      // Check if the like already exists for the given post and user
      const [existingLike, roes] = await connectPool.query(
        "SELECT * FROM likes WHERE post_id = ? AND user_id = ?",
        [postId, userId]
      );

      console.log("existingLike.length", existingLike.length);
      if (existingLike.length === 0) {
        // If the like does not exist, create a new like
        await connectPool.query(
          "INSERT INTO likes (post_id, user_id) VALUES (?, ?)",
          [postId, userId]
        );
        console.log("Like added successfully.");
        return { message: "Like added successfully." };
      } else {
        // If the like already exists, delete the existing like
        await connectPool.query(
          "DELETE FROM likes WHERE post_id = ? AND user_id = ?",
          [postId, userId]
        );
        console.log("Like removed successfully.");
        return { message: "Like removed successfully." };
      }
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}

module.exports = new PostModal();
