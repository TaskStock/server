
module.exports = {
    giveBadge: async(db, type, user_id) => {
        const insertQuery = 'INSERT INTO "Badge" (user_id, type) VALUES ($1, $2)';
        
        try {
            await db.query(insertQuery, [user_id, type]);
        } catch (err) {
            console.log('giveBadge ERROR:', err);
            throw err;
        }
    },
    getBadges: async(db, user_id) => {
        const selectQuery = 'SELECT type, created_time WHERE user_id = $1 ORDER BY created_time'

        try {
            const {rows} = await db.query(selectQuery, [user_id]);
            const badges = rows.map(row => row.type);
            return badges;
        } catch (err) {
            console.log('getBadges:', err);
            throw err;
        }
    }
}