const db = require('../config/db.js');
const fs = require('fs');
const { processNotice } = require('../service/noticeService.js')

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
    showRanking: async(user_id) => {
        const entireQuery = `
        SELECT strategy, user_id, image, user_name, cumulative_value, RANK() OVER (ORDER BY cumulative_value DESC) AS rank
        FROM "User"
        ORDER BY rank
        LIMIT 100
        `;
        const followerQuery = `
        SELECT strategy, user_id, image, user_name, cumulative_value, RANK() OVER (ORDER BY cumulative_value DESC) AS rank
        FROM "User" U
        JOIN "FollowMap" F
        ON U.user_id = F.follower_id
        WHERE F.following_id = $1
        `
        const followingQuery = `
        SELECT strategy, user_id, image, user_name, cumulative_value, RANK() OVER (ORDER BY cumulative_value DESC) AS rank
        FROM "User" U
        JOIN "FollowMap" F
        ON U.user_id = F.following_id
        WHERE F.follower_id = $1
        `;
        try {
            const entireRes = await db.query(entireQuery)
            const followerRes = await db.query(followerQuery, [user_id])
            const followingRes = await db.query(followingQuery, [user_id])

            const rankingAll = entireRes.rows
            const rankingFollower = followerRes.rows
            const rankingFollowing = followingRes.rows

            return [rankingAll, rankingFollower, rankingFollowing];

        } catch (e) {
            console.log(e.stack);
            return
        }
        
    },
    followUser: async(follower_id, following_id) => {
        if (follower_id == following_id) {
            console.log('자기 자신을 팔로우할 수 없습니다.');
            return false;
        }
        const query = `
        INSERT INTO "FollowMap" (follower_id, following_id, pending)
        SELECT
            $1,
            $2,
            CASE
                WHEN private = false THEN false
                ELSE true
            END
        FROM
            "User" U
        WHERE
            user_id = $2
        RETURNING *
        `;
        try {   
            const {rows} = await db.query(query, [follower_id, following_id]);
            const pending = rows[0].pending;
            if (!pending) {
                const updateQuery1 = 'UPDATE "User" SET follower_count = follower_count + 1 WHERE user_id = $1';
                const updateQuery2 = 'UPDATE "User" SET following_count = following_count + 1 WHERE user_id = $1';
                await db.query(updateQuery1, [following_id]) //await로 비동기 연산이 끝날 때까지 기다림
                await db.query(updateQuery2, [follower_id])
                isFollowingYou = true;
            } else {
                isFollowingYou = false;
            }
            
            // 상대도 나를 팔로우하고 있는지 확인
            try {
            const checkQuery = 'SELECT * FROM "FollowMap" WHERE follower_id = $1 AND following_id = $2';
            const {rows: checkRows} = await db.query(checkQuery, [following_id, follower_id]);
            if (checkRows.length == 0 && pending == false) {
                isFollowingMe = true;
            } else {
                isFollowingMe = false;
            }
            } catch (e) {
                console.log(e.stack);
                return false;
            } 

            // 상대에게 알림 생성 - fololler_id, following_id, type, pending, info, isFollowingMe, isFollowingYou
            const predata = {
                user_id: following_id,
                follower_id: follower_id,
                type: 'sns.follow',
                isFollowingYou: isFollowingYou,
                isFollowingMe: isFollowingMe,
                pending: pending
            };
            await processNotice(predata);

            return [true, pending, isFollowingMe, isFollowingYou];
        } catch (e) {
            console.log(e.stack);
            return [false];
        }
    },
    unfollowUser: async(follower_id, unfollowing_id) => {
        const query = 'DELETE FROM "FollowMap" WHERE Follower_id = $1 AND Following_id = $2';
        const updateQuery1 = 'UPDATE "User" SET follower_count = follower_count - 1 WHERE user_id = $1';
        const updateQuery2 = 'UPDATE "User" SET following_count = following_count - 1 WHERE user_id = $1';
        try {
            await db.query(query, [follower_id, unfollowing_id]);
            await db.query(updateQuery1, [unfollowing_id]) //await로 비동기 연산이 끝날 때까지 기다려줘야 함(LOCK 방지)
            await db.query(updateQuery2, [follower_id]) 
            return true;
        } catch (e) {
            console.log(e.stack);
            return false;
        }
    },
    searchUser: async(searchTarget, searchScope, user_id) => {
        // TODO isFollowingMe, isFollowingYou를 pending까지 검사해서 true/false로 반환
        const queryTarget = '%' + searchTarget + '%'
        if (searchScope == 'global') { //전체
            const query = `
            SELECT  
                U.user_id, U.image, U.user_name, U.cumulative_value, U.strategy, U.private, F1.pending,
                CASE 
                    WHEN F1.follower_id IS NOT NULL AND F1.pending = false THEN true
                    ELSE false
                END AS "isFollowingYou",
                CASE 
                    WHEN F2.following_id IS NOT NULL AND F2.pending = false THEN true
                    ELSE false
                END AS "isFollowingMe"
            FROM "User" U
            LEFT JOIN "FollowMap" F1 ON (U.user_id = F1.following_id AND F1.follower_id = $2)
            LEFT JOIN "FollowMap" F2 ON (U.user_id = F2.follower_id AND F2.following_id = $2)
            WHERE (U.user_name LIKE $1 OR U.email LIKE $1) AND U.user_id != $2
            `
            try {
                // 로그인한 사용자 = user_id, queryTarget = 검색어
                const {rows} = await db.query(query, [queryTarget, user_id]);
                return rows;
            } catch (e) {
                console.log(e.stack);
                return [];
            }
        } else if (searchScope == 'follower') { //나를 팔로우하는 사람
            const query = `
            SELECT  
                U.user_id, U.image, U.user_name, U.cumulative_value, U.strategy, U.private, FM1.pending,
                CASE
                    WHEN F1.pending = true THEN true
                    ELSE false
                END AS "isFollowingMe"
                CASE 
                    WHEN F2.following_id IS NOT NULL AND F2.pending = false THEN true
                    ELSE false
                END AS "isFollowingYou"
                FROM "User" U
            JOIN "FollowMap" F1 ON U.user_id = F1.follower_id
            LEFT JOIN "FollowMap" F2 ON U.user_id = F2.following_id AND F2.follower_id = $1
            WHERE F1.following_id = $1
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
            SELECT  
                U.user_id, U.image, U.user_name, U.cumulative_value, U.strategy, U.private, F1.pending,
                CASE 
                    WHEN F2.follower_id IS NOT NULL AND F2.pending = false THEN true
                    ELSE false
                END AS "isFollowingMe",
                CASE
                    WHEN F1.pending = true THEN true
                    ELSE false
                END AS "isFollowingYou"
            FROM "User" U
            JOIN "FollowMap" F1 ON U.user_id = F1.following_id
            LEFT JOIN "FollowMap" F2 ON U.user_id = F2.follower_id AND F2.following_id = $1
            WHERE F1.follower_id = $1
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
        //나를 팔로우하는 사람들 (F.following_id = user_id)
        const followerQuery = `
        SELECT 
            U.user_id, 
            U.image, 
            U.user_name, 
            U.cumulative_value, 
            U.private, 
            FM.pending,
            U.strategy,
            CASE
                WHEN FM.pending = false THEN true
                ELSE false
            END AS "isFollowingMe",
            CASE 
                WHEN F2.following_id IS NOT NULL AND F2.pending = false THEN true
                ELSE false
            END AS "isFollowingYou"
        FROM "User" U
        JOIN "FollowMap" FM ON U.user_id = FM.follower_id AND FM.following_id = $1
        LEFT JOIN "FollowMap" F2 ON U.user_id = F2.following_id AND F2.follower_id = $1
        WHERE FM.following_id = $1
    `;
        //내가 팔로우하는 사람들 (F.follower_id = user_id)
        const followingQuery = `
        SELECT 
            U.user_id, 
            U.image, 
            U.user_name, 
            U.cumulative_value, 
            U.private, 
            FM.pending,
            U.strategy,
            CASE
                WHEN F2.follower_id IS NOT NULL AND F2.pending = false THEN true
                ELSE false
            END AS "isFollowingMe",
            CASE 
                WHEN FM.pending = false THEN true
                ELSE false
            END AS "isFollowingYou"
        FROM "User" U
        JOIN "FollowMap" FM ON U.user_id = FM.following_id AND FM.follower_id = $1
        LEFT JOIN "FollowMap" F2 ON U.user_id = F2.follower_id AND F2.following_id = $1
        WHERE FM.follower_id = $1
        `;
        
        try {
            console.log(user_id)
            const {rows: followerList} = await db.query(followerQuery, [user_id]);
            const {rows: followingList} = await db.query(followingQuery, [user_id]);
            return [followerList, followingList]
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
    },
    editUserImage: async(user_id, image_path) => {
        const checkQuery = 'SELECT image FROM "User" WHERE user_id = $1';
        const updateQuery = 'UPDATE "User" SET image = $1 WHERE user_id = $2';
        try {
            const {rows} = await db.query(checkQuery, [user_id]);
            const oldImagePath = rows[0].image;
            if (oldImagePath !== 'public/images/ic_profile.png') {
                try {
                    await fs.promises.unlink(oldImagePath);
                    console.log('기존 이미지 삭제 성공');
                } catch (err) {
                    console.error('기존 이미지 삭제 실패', err);
                    throw err; // 에러 발생 시 함수 실행 중단
                }
            }
            await db.query(updateQuery, [image_path, user_id]);
            return true;
        } catch (e) {
            console.log(e.stack);
            return false;
        }
    },
    acceptPending: async(follower_id, following_id) => {
        const pendingQuery = 'UPDATE "FollowMap" SET pending = false WHERE follower_id = $1 AND following_id = $2';
        const followerCountQuery = 'UPDATE "User" SET follower_count = follower_count + 1 WHERE user_id = $1';
        const followingCountQuery = 'UPDATE "User" SET following_count = following_count + 1 WHERE user_id = $1';
        try {
            await db.query(pendingQuery, [follower_id, following_id]);
            await db.query(followerCountQuery, [following_id]);
            await db.query(followingCountQuery, [follower_id]);

            // 상대(팔로워)에게 알림 생성 - follower_id, following_id, type
            const predata = {
                user_id: follower_id,
                following_id: following_id,
                type: 'sns.accept'
            };
            await processNotice(predata);

            return true;
        } catch (e) {
            console.log(e.stack);
            return false;
        }
    },
    changeDefaultImage: async(user_id) => {
        const query = 'UPDATE "User" SET image = $1 WHERE user_id = $2';
        try {
            await db.query(query, ['public/images/ic_profile.png', user_id]);
            return true;
        } catch (e) {
            console.log(e.stack);
            return false;
        }
    },
    //팔로우 요청 취소
    cancelFollow: async(follower_id, following_id) => {
        const query = 'DELETE FROM "FollowMap" WHERE follower_id = $1 AND following_id = $2 RETURNING pending';
        try {
            const {rows} = await db.query(query, [follower_id, following_id]);
            if (rows[0].pending == false) {
                console.log('이미 팔로우 요청이 수락된 상태입니다.');
                rollbackQuery = 'INSERT INTO "FollowMap" (follower_id, following_id, pending) VALUES ($1, $2, false)';
                await db.query(rollbackQuery, [follower_id, following_id]);
                return 'alreadyAccepted'
            }
            console.log('팔로우 요청 취소 성공')
            return true;
        } catch (e) {
            console.log('팔로우 요청 취소 실패 - DB에 없는 레코드를 삭제하려고 했을 수 있음')
            console.log(e.stack);
            return false;
        }
    },
    userDetail: async(my_id, target_id) => {
        const userQuery = `
        SELECT 
            user_id AS user_id, 
            image, 
            user_name, 
            cumulative_value, 
            private, 
            follower_count, 
            following_count, 
            introduce, 
            CASE
                WHEN F1.follower_id IS NOT NULL AND F1.pending = false THEN true
                ELSE false
            END AS "isFollowingMe",
            CASE 
                WHEN F2.following_id IS NOT NULL AND F2.pending = false THEN true
                ELSE false
            END AS "isFollowingYou"
        FROM "User" U
        LEFT JOIN "FollowMap" F1 ON U.user_id = F1.following_id AND F1.follower_id = $1
        LEFT JOIN "FollowMap" F2 ON U.user_id = F2.follower_id AND F2.following_id = $1
        WHERE U.user_id = $1
        `;
        const valueQuery = 'SELECT * FROM "Value" WHERE user_id = $1 ORDER BY date';
        const todoQuery = 'SELECT * FROM "Todo" WHERE user_id = $1 ORDER BY date';
        const projectQuery = 'SELECT * FROM "Project" WHERE user_id = $1 ORDER BY project_id';
        try {
            const {rows: targetRows} = await db.query(userQuery, [target_id]);
            const {rows: valueRows} = await db.query(valueQuery, [target_id]);
            const {rows: todoRows} = await db.query(todoQuery, [target_id]);
            const {rows: projectRows} = await db.query(projectQuery, [target_id]);

            return [targetRows[0], valueRows, todoRows, projectRows];
        } catch (e) {
            console.log(e.stack);
            throw e;
        }
    },
}