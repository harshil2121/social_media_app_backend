const { getCurrentTime, unlinkFiles } = require("../common/helper");

class FollowModal {
  constructor() {}

  async followUser(following_id, user_id) {
    try {
      // Insert follow data into the 'follow' table
      let followData = {
        follower_id: user_id,
        following_id: following_id, // Assuming input.following_id contains the ID of the user being followed
        created_at: getCurrentTime(),
      };

      const [followRows, followFields] = await connectPool.query(
        "INSERT INTO follow SET ?",
        followData
      );

      return followData;
    } catch (error) {
      throw error;
    }
  }

  async unfollowUser(following_id, user_id) {
    try {
      // Delete the existing follow record
      const [followRows, followFields] = await connectPool.query(
        "DELETE FROM follow WHERE follower_id = ? AND following_id = ?",
        [user_id, following_id]
      );

      // Check if any rows were affected
      if (followRows.affectedRows === 0) {
        throw new Error("No follow record found to unfollow.");
      }

      return { success: true };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new FollowModal();
