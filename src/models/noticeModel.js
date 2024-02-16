module.exports = {
    createNotice: async (db, noticeData) => {
        const query = 'INSERT INTO "Notice" (user_id, content, type, info) VALUES ($1, $2, $3, $4)';
        try {
            await db.query(query, [noticeData.user_id, noticeData.content, noticeData.type, noticeData.info]);
            return true;
        } catch (err) {
            err.name = 'createNoticeError';
            throw err;
        }
    },
    checkNewNotice: async (db, user_id) => {
        const query = 'SELECT COUNT(*) FROM "Notice" WHERE user_id = $1 AND is_read = false';
        try {
            const {rows} = await db.query(query, [user_id]);
            const newNoticeCount = rows[0].count;

            if (newNoticeCount > 0) {
                return true
            } else {
                return false
            }
        } catch(err) {
            err.name = 'checkNewNoticeError';
            throw err;
        }
    },
    getAllNotice: async (db, user_id) => {
        const query = `
            SELECT notice_id, content, type, info, is_read, created_time 
            FROM "Notice" 
            WHERE user_id = $1
            UNION ALL
            SELECT notice_id, content, type, info, is_read, created_time
            FROM "AdminNotice"
            ORDER BY created_time DESC
            `;
        const updateQuery = 'UPDATE "Notice" SET is_read = true WHERE user_id = $1';
        try {
            const {rows: noticeList} = await db.query(query, [user_id]);
            await db.query(updateQuery, [user_id]);
            return noticeList;
        }
        catch (err) {
            err.name = 'getAllNoticeError';
            throw err;
        }
    },
    getNoticeById: async (db, notice_id) => {
        const query = 'SELECT content, type, info, is_read, created_time, image FROM "AdminNotice" WHERE notice_id = $1';
        try {
            const {rows} = await db.query(query, [notice_id]);
            const noticeData = rows[0];
            return noticeData;
        }
        catch (err) {
            err.name = 'getNoticeByIdError';
            throw err;
    }
    },
    changeNoticeSetting: async (db, user_id, isPushOn) => {
        try {
            const query = 'UPDATE "UserSetting" SET is_push_on = $1 WHERE user_id = $2';
            console.log('changeNoticeSetting : ', user_id, isPushOn);
            await db.query(query, [isPushOn, user_id]);
        } catch (err) {
            err.name = 'changeNoticeSettingError';
            throw err;
        }
    },
    saveFCMToken: async (db, user_id, isPushOn ,FCMToken) => {
        const query = 'UPDATE "UserSetting" SET fcm_token = $1, is_push_on = $2 WHERE user_id = $3';
        try {
            await db.query(query, [FCMToken, isPushOn, user_id]);
        } catch (err) {
            err.name = 'saveFCMTokenError';
            throw err;
        }
    },
    updateFCMToken: async(db, user_id, FCMToken) => {
        const query = 'UPDATE "UserSetting" SET fcm_token = $1 WHERE user_id = $2';
        try {
            await db.query(query, [FCMToken, user_id]);
        } catch(err) {
            err.name = 'updateFCMTokenError';
            throw err;
        }
    },
    getFCMToken: async (db, user_id) => {
        const query = 'SELECT fcm_token FROM "UserSetting" WHERE is_push_on = true AND fcm_token IS NOT NULL AND user_id = $1';
        try {
            const {rows} = await db.query(query, [user_id]);
            if (rows.length === 0) {
                return []
            } else {
                const token = rows[0].fcm_token
                return token
            }
        } catch(err) {
            err.name = 'getFCMTokenError';
            throw err
        }
    },
    getAllFCMTokens: async (db, user_id_list) => {
        const query = 'SELECT fcm_token FROM "UserSetting" WHERE is_push_on = true AND user_id IN (unnest($1::integer[]));';

        try {
            const {rows} = await db.query(query, [user_id_list]); 
            if (rows.length === 0) {
                return []
            } else {
                const tokens = rows.map(row => row.fcm_token);
                return tokens
            }
        } catch(err) {
            err.name = 'getAllFCMTokensError';
            throw err
        }
    },
    getAllFCMTokensInRegion: async (db, region) => {
        const query = `
        SELECT fcm_token 
        FROM "UserSetting" 
        WHERE is_push_on = true AND fcm_token IS NOT NULL AND user_id IN (
            SELECT user_id 
            FROM "User" 
            WHERE region = $1
        )
        `;

        try {
            const {rows} = await db.query(query, [region]); 
            if (rows.length === 0) {
                return []
            } else {
                const tokens = rows.map(row => row.fcm_token);
                return tokens
            }
        } catch(err) {
            err.name = 'getAllFCMTokensInRegionError';
            throw err
        }
    },
    saveCustomerSuggestion: async (db, user_id, content, email) => {
        const query = 'INSERT INTO "CustomerService" (user_id, content, email) VALUES ($1, $2, $3)';
        try {
            await db.query(query, [user_id, content, email]);
        } catch (err) {
            err.name = 'saveCustomerSuggestionError';
            throw err;
        }
    }
}
;