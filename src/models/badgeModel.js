const { processNotice } = require('../service/noticeService.js')

module.exports = {
    giveBadge: async(db, type, user_id) => {
        const insertQuery = 'INSERT INTO "Badge" (user_id, type) VALUES ($1, $2)';
        
        const preData = {
            user_id: user_id,
            type: 'badge'
        }
        
        processNotice(db. preData);
        try {
            await db.query(insertQuery, [user_id, type]);
        } catch (err) {
            err.name = 'giveBadgeError';
            throw err;
        }
    },
    getBadges: async(db, user_id) => {
        const selectQuery = 'SELECT type, created_time FROM "Badge" WHERE user_id = $1 ORDER BY created_time'

        try {
            const {rows: badges} = await db.query(selectQuery, [user_id]);
            return badges;
        } catch (err) {
            err.name = 'getBadgesError';
            throw err;
        }
    }
}