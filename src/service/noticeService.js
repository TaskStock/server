module.exports = {
    // TODO : 알림 DB에 추가
    createNotice: async (noticeData) => {
        const query = 'INSERT INTO notice (user_id, content, notice_type) VALUES (?, ?, ?)';
        try {
            await db.query(query, [noticeData.user_id, noticeData.content, noticeData.notice_type]);
            return true;
        } catch (err) {
            console.log('createNotice ERROR : ', err);
            return false;
        }
    }
};