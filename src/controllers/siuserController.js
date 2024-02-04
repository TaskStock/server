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
    getItemsTodaypopular: async(req, res, next) =>{
        const db = req.dbClient;
        try{
            const stockitems = await stockitemModel.getTodaypopular(db);

            await db.query('COMMIT');
            return res.json({stockitems: stockitems});
        }catch(error){
            await db.query('ROLLBACK');
            next(error);
        }finally{
            db.release();
        }
    },
    getItemsTodayrecommend: async(req, res, next) =>{
        const db = req.dbClient;
        try{
            const stockitems = await stockitemModel.getTodayrecommend(db);

            await db.query('COMMIT');
            return res.json({stockitems: stockitems});
        }catch(error){
            await db.query('ROLLBACK');
            next(error);
        }finally{
            db.release();
        }
    },
    getItemsAll: async(req, res, next) =>{
        const user_id = req.user.user_id;
        const region = req.user.region;

        const db = req.dbClient;
        try{
            const sttime = transdate.getSettlementTimeInUTC(region);

            const stockitems = await stockitemModel.getAll(db, sttime);

            for(let i=0;i<stockitems.length;i++){
                if(stockitems[i].user_id === null){
                    stockitems[i].is_add_today = false;
                    continue;
                }
                stockitems[i].is_add_today=stockitems[i].user_id.includes(user_id);
            }

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