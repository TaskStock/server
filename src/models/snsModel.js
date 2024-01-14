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
    searchUser: async(searchTarget, searchScope, user_id) => {
        const queryTarget = '%' + searchTarget + '%'
        if (searchScope == 'global') { //전체
            const query = `
                SELECT  user_id, image, user_name, cumulative_value
                FROM "User"
                WHERE (user_name LIKE $1 OR email LIKE $1) AND user_id != $2
                `
            try {
                const excludedId = user_id;
                const {rows} = await db.query(query, [queryTarget, excludedId]);
                return rows;
            } catch (e) {
                console.log(e.stack);
                return [];
            }
        } else if (searchScope == 'follower') { //나를 팔로우하는 사람
            const query = `
                SELECT U.user_id, U.image, U.user_name, U.cumulative_value
                FROM "User" U
                JOIN "FollowMap" F
                ON U.user_id = F.follower_id
                WHERE F.following_id = $1
                AND (U.user_name LIKE $2 OR U.email LIKE $2)
            `
            try {
                const {rows} = await db.query(query, [user_id, queryTarget]);
                return rows;
            } catch (e) {
                console.log(e.stack);
                return [];
            }
        } else if (searchScope == 'following') { //내가 팔로우하는 사람(팔로잉)
            const query = `
                SELECT U.user_id, U.image, U.user_name, U.cumulative_value
                FROM "User" U
                JOIN "FollowMap" F
                ON U.user_id = F.following_id
                WHERE F.follower_id = $1
                AND (U.user_name LIKE $2 OR U.email LIKE $2)
            `
            try {
                console.log(user_id)
                const {rows} = await db.query(query, [user_id, queryTarget]);
                return rows;
            } catch (e) {
                console.log(e.stack);
                return [];
            }
        } else {
            console.log('searchScope error. 잘못된 검색 범위입니다.');
            return [];
        }
    },
    showFollowList: async(user_id) => {
        const query = `
            SELECT user_id, image, user_name, cumulative_value, 'follower' AS follow_type
            FROM "User"
            WHERE user_id IN (
                SELECT follower_id
                FROM "FollowMap"
                WHERE following_id = $1
            )            
            UNION ALL
            SELECT user_id, image, user_name, cumulative_value, 'following' AS follow_type
            FROM "User"
            WHERE user_id IN (
                SELECT following_id
                FROM "FollowMap"
                WHERE follower_id = $1
            )
        `
        try {
            const {rows} = await db.query(query, [user_id]);
            return rows;
        } catch (e) {
            console.log(e.stack);
            return false;
        }
    },
    editUserInfo: async(user_id, user_name, introduce) => {
        const query = 'UPDATE "User" SET user_name = $1, introduce = $2 WHERE user_id = $3';
        try {
            await db.query(query, [user_name, introduce, user_id]);
            return true;
        } catch (e) {
            console.log(e.stack);
            return false;
        }
    }
}