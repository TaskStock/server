const db = require('../config/db.js');

module.exports = {
    createNotice: async (noticeData) => {
        const query = 'INSERT INTO "Notice" (user_id, content, type, info) VALUES ($1, $2, $3, $4)';
        try {
            await db.query(query, [noticeData.user_id, noticeData.content, noticeData.type, noticeData.info]);
            return true;
        } catch (err) {
            console.log('createNotice ERROR : ', err);
            throw err;
        }
    },
    getAllNotice: async (user_id) => {
        const query = 'SELECT content, type, info, is_read, created_time FROM "Notice" WHERE user_id = $1';
        const updateQuery = 'UPDATE "Notice" SET is_read = true WHERE user_id = $1';
        try {
            const {rows: noticeList} = await db.query(query, [user_id]);
            await db.query(updateQuery, [user_id]);
            return noticeList;
        }
        catch (err) {
            console.log('getAllNotice ERROR : ', err.stack);
            throw err;
        }
    },
    getNoticeById: async (notice_id) => {
        const query = 'SELECT content, type, info, is_read, created_time FROM "Notice" WHERE notice_id = ?';
        try {
            const {rows} = await db.query(query, [notice_id]);
            const noticeData = rows[0];
            noticeData.logo = '../../public/images/logo_background.png';
            return noticeData;
        }
        catch (err) {
            console.log('getNoticeById ERROR : ', err.stack);
            throw err;
    }
    }
}
;