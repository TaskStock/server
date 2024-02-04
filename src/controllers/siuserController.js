const simapModel = require('../models/simapModel.js');
const stockitemModel = require('../models/stockitemModel.js');
const sivalueModel = require('../models/sivalueModel.js');
const sistatisticsModel = require('../models/sistatisticsModel.js');

const transdate = require('../service/transdateService.js');

module.exports = {
    getItemsMyinterest: async(req, res, next) =>{
        const user_id = req.user.user_id;

        const db = req.dbClient;
        try{
            const stockitems = await stockitemModel.getMyinterest(db, user_id);

            await db.query('COMMIT');
            return res.json({stockitems: stockitems});
        }catch(error){
            await db.query('ROLLBACK');
            next(error);
        }finally{
            db.release();
        }
    },
}