const db = require('../config/db.js');

module.exports = {
    changePrivate: async(user_id, private) => {
        const query = 'UPDATE "User" SET Private = $1 WHERE User_id = $2';
        try {
            await db.query(query, [private, user_id])
            return true;
        } catch (e) {
            console.log(error.stack);
            return false;
        }
    },
    showRanking: async() => {
        const query = `
        SELECT user_id, user_name, cumulative_value, RANK() OVER (ORDER BY cumulative_value DESC) AS rank
        FROM "User"
        ORDER BY rank;
        `;
        try {
            const {rows} = await db.query(query);       
            return rows;
        } catch (e) {
            console.log(e.stack);
            return false;
        }
        
    },
    followUser: async(follower_id, following_id) => {
        const query = 'INSERT INTO "FollowMap" (Follower_id, Following_id) VALUES ($1, $2)';
        try {
            await db.query(query, [follower_id, following_id]);
            return true;
        } catch (e) {
            console.log(e.stack);
            return false;
        }
    },
    unfollowUser: async(follower_id, unfollowing_id) => {
        const query = 'DELETE FROM "FollowMap" WHERE Follower_id = $1 AND Following_id = $2';
        try {
            await db.query(query, [follower_id, unfollowing_id]);
            return true;
        } catch (e) {
            console.log(e.stack);
            return false;
        }
    }
}