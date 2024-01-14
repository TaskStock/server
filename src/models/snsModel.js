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
        SELECT user_id, image, user_name, cumulative_value, RANK() OVER (ORDER BY cumulative_value DESC) AS rank
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
    },
    searchUser: async(searchTarget, searchScope) => {
        if (searchScope == 'global') { //전체
            const query = `
                SELECT  user_id, image, user_name, cumulative_value
                FROM "User"
                WHERE user_name LIKE $1 OR email LIKE $1
                `
            const queryTarget = '%' + searchTarget + '%'
            try {
                const {rows} = await db.query(query, [queryTarget]);
                console.log(rows);
                return rows;
            } catch (e) {
                console.log(e.stack);
                return false;
            }
        } else if (searchScope == 'follower') { //나를 팔로우하는 사람
            const query = `
                SELECT user_id, image, user_name, cumulative_value
                FROM "User"
                WHERE user_id IN (
                    SELECT follower_id
                    FROM "FollowMap"
                    WHERE following_id = $1
                )            
            `
            try {
                await db.query(query, [searchTarget]);
                return true;
            } catch (e) {
                console.log(e.stack);
                return false;
            }
        } else if (searchScope == 'following') { //내가 팔로우하는 사람
            const query = `
                SELECT user_id, image, user_name, cumulative_value
                FROM "User"
                WHERE user_id IN (
                    SELECT following_id
                    FROM "FollowMap"
                    WHERE follower_id = $1
                )            
            `
            try {
                await db.query(query, [searchTarget]);
                return true;
            } catch (e) {
                console.log(e.stack);
                return false;
            }
        }
    }
}