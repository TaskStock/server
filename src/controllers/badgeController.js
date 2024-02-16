const badgeModel = require("../models/badgeModel.js")
const db = require('../config/db.js')

module.exports = {
    giveBadge: async(req, res, next) => {
        const cn = await db.connect(); 
        try {
            await cn.query('BEGIN');
            const user_id = req.user.user_id;
            const type = req.body.type;

            await badgeModel.giveBadge(cn, type, user_id);
            const badges = await badgeModel.getBadges(cn, user_id);

            cn.query('COMMIT');
            return res.status(200).json({
                result: 'success',
                badges: badges,
            })
        } catch (err) {
            cn.query('ROLLBACK');
            next(err);
            
        } finally {
            cn.release();
        }
    },
    getBadges: async(req, res) => {
        try {
            const user_id = req.params.user_id;
            
            const badges = await badgeModel.getBadges(db, user_id);
            return res.json({
                result: 'success',
                badges: badges
            })
        } catch (err) {
            next(err);
            
        }
    }
}