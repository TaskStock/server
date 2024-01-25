const db = require('../config/db.js');

module.exports = {
    createNotice: async (noticeData) => {
        const query = 'INSERT INTO "Notice" (user_id, content, type, info) VALUES ($1, $2, $3, $4)';
        try {
            await db.query(query, [noticeData.user_id, noticeData.content, noticeData.type, noticeData.info]);
            return true;
        } catch (err) {
            console.log('createNotice ERROR : ', err);
            return false;
        }
    },
    getAllNotice: async (user_id) => {
        const query = 'SELECT content, notice_type, is_read, created_time FROM notice WHERE user_id = ?';
        try {
            const {rows: noticeData} = await db.query(query, [user_id]);
            return noticeData;
        }
        catch (err) {
            console.log('getAllNotice ERROR : ', err.stack);
            return
        }
    },
};