const badgeModel = require("../models/badgeModel.js")
const db = require('../config/db.js')

module.exports = {
    giveBadge: async(req, res) => {
        const cn = await db.connect();
        try {
            const user_id = req.user.user_id;
            const type = req.body.type;

            await badgeModel.giveBadge(cn, type, user_id);
            const badges = await badgeModel.getBadges(cn, user_id);

            cn.query('COMMIT');
            return res.json({
                reuslt: 'success',
                badges: badges
            })
        } catch (err) {
            cn.query('ROLLBACK');
            return res.status(500).json({
                result: 'fail'
            })
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
            return res.status(500).json({
                result: 'fail'
            })
        }
    }
}