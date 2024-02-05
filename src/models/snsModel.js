const fs = require('fs');
const { processNotice, sendPush } = require('../service/noticeService.js')


module.exports = {
    changePrivate: async(db, user_id, private) => {
        const query = 'UPDATE "User" SET Private = $1 WHERE User_id = $2';
        try {
            await db.query(query, [private, user_id])
            return true;
        } catch (e) {
            console.log(error.stack);
            return false;
        }
    },
    // showRanking: async(user_id) => {
    //     const entireQuery = `
    //     SELECT strategy, user_id, image, user_name, cumulative_value, RANK() OVER (ORDER BY cumulative_value DESC) AS rank
    //     FROM "User"
    //     ORDER BY rank
    //     LIMIT 100
    //     `;
    //     const followerQuery = `
    //     SELECT strategy, user_id, image, user_name, cumulative_value, RANK() OVER (ORDER BY cumulative_value DESC) AS rank
    //     FROM "User" U
    //     JOIN "FollowMap" F
    //     ON U.user_id = F.follower_id
    //     WHERE F.following_id = $1
    //     `
    //     const followingQuery = `
    //     SELECT strategy, user_id, image, user_name, cumulative_value, RANK() OVER (ORDER BY cumulative_value DESC) AS rank
    //     FROM "User" U
    //     JOIN "FollowMap" F
    //     ON U.user_id = F.following_id
    //     WHERE F.follower_id = $1
    //     `;
    //     try {
    //         const entireRes = await db.query(entireQuery)
    //         const followerRes = await db.query(followerQuery, [user_id])
    //         const followingRes = await db.query(followingQuery, [user_id])

    //         const rankingAll = entireRes.rows
    //         const rankingFollower = followerRes.rows
    //         const rankingFollowing = followingRes.rows

    //         return [rankingAll, rankingFollower, rankingFollowing];

    //     } catch (e) {
    //         console.log(e.stack);
    //         return
    //     }
        
    // },
    // 비공개인 애가 공개인 애한테 팔로우를 걸었어, 알람에 뜸 - 공개인 애가 비공개인 애한테 팔로우 요청을 보냄
    followUser: async(db, follower_id, following_id, notice_id) => {
        if (follower_id == following_id) {
            console.log('자기 자신을 팔로우할 수 없습니다.');
            return false;
        }
        /*
            isFollowingMe: predata.isFollowingMe, // 팔로우 당한 사람 입장 isFollowingMe
            isFollowingYou: predata.isFollowingYou, // 팔로우 당한 사람 입장 isFollowingYou
            pending: predata.pending, // 팔로우 당한 사람 입장 pending
            displayAccept: displayAccept, // 팔로우 당한 사람 입장 displayAccept
            private: predata.private // 팔로우 한 사람 입장 private
        */
        let isFollowingMe;
        let isFollowingYou;
        let followerPrivate;
        let followingPending;
        
        const insertQuery = `
        WITH inserted AS (
            INSERT INTO "FollowMap" (follower_id, following_id, pending)
            SELECT
                $1,
                $2,
                CASE
                    WHEN U.private = false THEN false
                    ELSE true
                END
            FROM
                "User" U
            WHERE
                U.user_id = $2
            RETURNING follower_id, pending
        )
        SELECT i.pending, U.private
        FROM inserted i
        JOIN "User" U ON i.follower_id = U.user_id;
        `;
        try {
            if (notice_id != undefined) {
                console.log('notice_id 있는 곳')
                const noticeQuery = `
                UPDATE "Notice"
                SET info = jsonb_set(
                                jsonb_set(
                                    info, 
                                    '{pending}', 
                                    (info ->> 'private')::jsonb
                                ), 
                                '{isFollowingYou}', 
                                ((NOT (info ->> 'private')::boolean)::text::jsonb)
                            )
                WHERE notice_id = $1;
                `
                await db.query(noticeQuery, [notice_id])
            } else {
                console.log('notice_id 없는 곳 탐')
                const noticeQuery2 = `
                UPDATE "Notice"
                SET info = jsonb_set(
                                jsonb_set(
                                    info, 
                                    '{pending}', 
                                    (info ->> 'private')::jsonb
                                ), 
                                '{isFollowingYou}', 
                                ((NOT (info ->> 'private')::boolean)::text::jsonb)
                            )
                WHERE notice_id IN (
                    SELECT N.notice_id
                    FROM "Notice" N
                    JOIN "User" U
                    ON (N.user_id = U.user_id)
                    WHERE (N.user_id = $1 AND N.info ->> 'target_id' = $2)
                );
                `
                //user_id(팔로우 버튼 누른 주인 == 알림 주인)
                await db.query(noticeQuery2, [follower_id, following_id])
            }

            const {rows: insertRows} = await db.query(insertQuery, [follower_id, following_id]);
            const followerPending = insertRows[0].pending;
            followerPrivate = insertRows[0].private;
            if (!followerPending) { // 상대가 공개 계정(=요청 대기 중이 아닐 때)
                const updateQuery1 = 'UPDATE "User" SET follower_count = follower_count + 1 WHERE user_id = $1';
                const updateQuery2 = 'UPDATE "User" SET following_count = following_count + 1 WHERE user_id = $1';
                await db.query(updateQuery1, [following_id]) //await로 비동기 연산이 끝날 때까지 기다림
                await db.query(updateQuery2, [follower_id])
                isFollowingMe = true; // 팔로우 당한 사람 입장
            } else { // 상대가 비공개 계정일 때(요청 대기 중일 때)
                isFollowingMe = false; //팔로우 당한 사람 입장
            }
            
            // 상대 입장에서의 isFollowingYou 체크 
            const checkQuery = 'SELECT pending FROM "FollowMap" WHERE follower_id = $1 AND following_id = $2';
            const {rows: checkRows} = await db.query(checkQuery, [following_id, follower_id]);
            if (checkRows.length == 0) { // 상대가 나를 팔로우하지 않았을 때
                isFollowingYou = false; // 팔로우 당한 사람 입장
                followingPending = false; // 팔로우 한 사람 입장
            } else { // 상대가 나를 팔로우한 행이 있을 때
                followingPending = checkRows[0].pending
                if (followingPending = false) {
                    isFollowingYou = true
                } else {
                    isFollowingYou = false
                }
            }

            // 상대에게 알림 생성
            const predata = {
                user_id: following_id, 
                follower_id: follower_id,
                type: 'sns',
                isFollowingYou: isFollowingYou, // 상대 입장 isFollowingYou
                isFollowingMe: isFollowingMe, // 상대 입장 isFollowingMe
                followingPending: followingPending, // 상대 입장 조회 pending
                followerPending: followerPending,
                private: followerPrivate // 내 입장 private
            };
            await processNotice(predata);
            await sendPush(predata);

            return true;
        } catch (e) {
            console.log(e.stack);
            return false;
        }
    },
    unfollowUser: async(db, follower_id, unfollowing_id, notice_id) => {
        const query = 'DELETE FROM "FollowMap" WHERE Follower_id = $1 AND Following_id = $2';
        const updateQuery1 = 'UPDATE "User" SET follower_count = follower_count - 1 WHERE user_id = $1';
        const updateQuery2 = 'UPDATE "User" SET following_count = following_count - 1 WHERE user_id = $1';

        try {
            await db.query(query, [follower_id, unfollowing_id]);
            await db.query(updateQuery1, [unfollowing_id])
            await db.query(updateQuery2, [follower_id]) 
            if (notice_id != undefined) {
                const noticeQuery = `
                UPDATE "Notice"
                SET info = info || '{"isFollowingYou" : false}'
                WHERE notice_id = $1
                `
                await db.query(noticeQuery, [notice_id])
            } else {
                const noticeQuery2 = `
                UPDATE "Notice"
                SET info = info || '{"isFollowingYou" : false}'
                WHERE notice_id IN (
                    SELECT N.notice_id
                    FROM "Notice" N
                    JOIN "User" U
                    ON (N.user_id = U.user_id)
                    WHERE N.user_id = $1 AND N.info ->> 'target_id' = $2
                )
                `
                // user_id는 공지주인 == follower_id
                await db.query(noticeQuery2, [follower_id, unfollowing_id])
            }

            return true;
        } catch (e) {
            console.log(e.stack);
            return false;
        }
    },
    searchUser: async(db, searchTarget, searchScope, user_id) => {
        // TODO isFollowingMe, isFollowingYou를 pending까지 검사해서 true/false로 반환
        const queryTarget = '%' + searchTarget + '%'
        if (searchScope == 'global') { //전체
            // 검색 대상의 정보 넘겨야 함
            const query = `
            SELECT  
                U.user_id, 
                U.image, 
                U.user_name, 
                U.cumulative_value, 
                U.strategy, 
                U.private,
                CASE 
                    WHEN FM.following_id IS NOT NULL AND FM.pending = false THEN true
                    ELSE false
                END AS "isFollowingYou",
                CASE
                    WHEN FM2.follower_id IS NOT NULL AND FM2.pending = false THEN true
                    ELSE false
                END AS "isFollowingMe",
                CASE 
                    WHEN FM.following_id IS NOT NULL AND FM.pending = true THEN true
                    ELSE false
                END AS "pending"
            FROM "User" U
            LEFT JOIN "FollowMap" FM ON U.user_id = FM.following_id AND FM.follower_id = $1
            LEFT JOIN "FollowMap" FM2 ON U.user_id = FM2.follower_id AND FM2.following_id = $1
            WHERE (U.user_name LIKE $2 OR U.email LIKE $2) AND U.user_id != $1
            `
            // 상대 사용자($1) 로그인한 사용자($2)
            try {
                const {rows: result} = await db.query(query, [user_id, queryTarget]);
                return result;
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
    showFollowList: async(db, user_id) => {
        //나를 팔로우하는 사람들 (F.following_id = user_id)
        const followerQuery = `
        SELECT 
            U.user_id, 
            U.image, 
            U.user_name, 
            U.cumulative_value, 
            U.private, 
            U.strategy,
            CASE
                WHEN F2.pending IS NOT NULL THEN F2.pending
                ELSE false
            END AS "pending",
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
            const {rows: followerList} = await db.query(followerQuery, [user_id]);
            const {rows: followingList} = await db.query(followingQuery, [user_id]);
            return [followerList, followingList]
        } catch (e) {
            console.log(e.stack);
            return false;
        }
    },
    editUserInfo: async(db, user_id, user_name, introduce) => {
        const query = 'UPDATE "User" SET user_name = $1, introduce = $2 WHERE user_id = $3';
        try {
            await db.query(query, [user_name, introduce, user_id]);
            return true;
        } catch (e) {
            console.log(e.stack);
            return false;
        }
    },
    editUserImage: async(db, user_id, image_path) => {
        const checkQuery = 'SELECT image FROM "User" WHERE user_id = $1';
        const updateQuery = 'UPDATE "User" SET image = $1 WHERE user_id = $2';
        try {
            const {rows} = await db.query(checkQuery, [user_id]);
            const oldImagePath = rows[0].image;
            if (oldImagePath !== '') { // 기본 이미지가 아닐 경우
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
    acceptPending: async(db, follower_id, following_id, notice_id) => {
        const pendingQuery = 'UPDATE "FollowMap" SET pending = false WHERE follower_id = $1 AND following_id = $2';
        const followerCountQuery = 'UPDATE "User" SET follower_count = follower_count + 1 WHERE user_id = $1';
        const followingCountQuery = 'UPDATE "User" SET following_count = following_count + 1 WHERE user_id = $1';
        
        const followCheckQuery = 'SELECT pending FROM "FollowMap" WHERE follower_id = $1 AND following_id = $2';
        
        let noticeQuery;

        try {
            await db.query(pendingQuery, [follower_id, following_id]);
            await db.query(followerCountQuery, [following_id]);
            await db.query(followingCountQuery, [follower_id]);

            let isFollowingYou;
            const {rows: followCheckRows} = await db.query(followCheckQuery, [following_id, follower_id]);
            if (followCheckRows.rowCount !== 0 && followCheckRows[0].pending == false) {
                noticeQuery = `
                UPDATE "Notice" 
                SET info = info || '{"pending": false, "isFollowingMe": true, "displayAccept": false, "isFollowingYou": true}'
                WHERE notice_id = $1;
                `
            } else {
                noticeQuery = `
                UPDATE "Notice" 
                SET info = info || '{"pending": false, "isFollowingMe": true, "displayAccept": false, "isFollowingYou": false}'
                WHERE notice_id = $1;
                `
            }

            await db.query(noticeQuery, [notice_id])

            // 상대(팔로워)에게 알림 생성 - follower_id, following_id, type
            const predata = {
                user_id: follower_id, // 알림을 받을 사람
                following_id: following_id, // 터치하면 이동할 대상
                type: 'general' // 알림 타입
            };
            await processNotice(predata);
            await sendPush(predata);

            return true;
        } catch (e) {
            console.log(e.stack);
            return false;
        }
    },
    changeDefaultImage: async(db, user_id) => {
        const query = 'UPDATE "User" SET image = $1 WHERE user_id = $2';
        try {
            await db.query(query, ['', user_id]);
            return true;
        } catch (e) {
            console.log(e.stack);
            return false;
        }
    },
    //팔로우 요청 취소
    cancelFollow: async(db, follower_id, following_id, notice_id) => {
        const query = 'DELETE FROM "FollowMap" WHERE follower_id = $1 AND following_id = $2 RETURNING pending';
        try {
            const {rows} = await db.query(query, [follower_id, following_id]);
            
            if (rows[0].pending == false) {
                console.log('이미 팔로우 요청이 수락된 상태입니다.');
                rollbackQuery = 'INSERT INTO "FollowMap" (follower_id, following_id, pending) VALUES ($1, $2, false)';
                await db.query(rollbackQuery, [follower_id, following_id]);
                return 'alreadyAccepted'
            }
            
            if (notice_id !== undefined) {
                // 팔로우 요청한 사람 알림 수정
                const followerNoticeQuery = `
                UPDATE "Notice"
                SET info = info || '{"pending" : false, "isFollowingYou" : false}'
                WHERE notice_id = $1
                `
                await db.query(followerNoticeQuery, [notice_id])
            } else {
                const followNoticeQuery2 = `
                UPDATE "Notice"
                SET info = info || '{"pending" : false, "isFollowingYou" : false}'
                WHERE notice_id IN (
                    SELECT N.notice_id
                    FROM "Notice" N
                    JOIN "User" U
                    ON (N.user_id = U.user_id)
                    WHERE N.user_id = $1 AND N.info ->> 'target_id' = $2
                )
                `
                // user_id(공지주인 = follower_id)
                await db.query(followNoticeQuery2, [follower_id,following_id])
            }
            // 팔로우 요청 받은 사람 알림 삭제
            const followingNoticeQuery = `
            DELETE FROM "Notice" 
            WHERE notice_id IN (
                SELECT N.notice_id
                FROM "Notice" N
                JOIN "User" U
                ON (N.user_id = U.user_id)
                WHERE N.user_id = $1 AND N.info ->> 'target_id' = $2
            )
            `
            await db.query(followingNoticeQuery, [following_id, follower_id])
            



            console.log('팔로우 요청 취소 성공')
            return true;

        } catch (e) {
            console.log('팔로우 요청 취소 실패 - DB에 없는 레코드를 삭제하려고 했을 수 있음')
            console.log(e.stack);
            return false;
        }
    },
    userDetail: async(db, my_id, target_id) => {
        const userQuery = `
        SELECT
            U.user_id,
            U.image,
            U.user_name,
            U.cumulative_value,
            U.private,
            CASE
                WHEN F1.pending IS NOT NULL THEN F1.pending
                ELSE false
            END AS "pending",
            U.follower_count,
            U.following_count,
            U.introduce,
            U.strategy,
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
        WHERE U.user_id = $1
        `;
        const valueQuery = 'SELECT * FROM "Value" WHERE user_id = $1 ORDER BY date';
        const todoQuery = 'SELECT * FROM "Todo" WHERE user_id = $1 ORDER BY date';
        const projectQuery = 'SELECT * FROM "Project" WHERE user_id = $1 ORDER BY project_id';
        try {
            const {rows: targetRows} = await db.query(userQuery, [target_id, my_id]);
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