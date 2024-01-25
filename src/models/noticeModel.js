const db = require('../config/db.js');

module.exports = {
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