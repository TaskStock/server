const stockitemModel = require('../models/stockitemModel.js');

const transdate = require('../service/transdateService.js');

const db = require('../config/db.js');

module.exports = {
    getItemsAll: async(req, res, next) =>{
        const region = req.user.region;

        try{
            const sttime = transdate.getSettlementTimeInUTC(region);

            const stockitems = await stockitemModel.getAll(db, sttime);

            return res.json({stockitems: stockitems});
        }catch(error){
            next(error);
        }
    },
    getItem: async(req, res, next) =>{
        const stockitem_id = req.params.stockitem_id;
        const user_id = req.user.user_id;
        const region = req.user.region;

        try{
            const sttime = transdate.getSettlementTimeInUTC(region);

            const stockitem = await stockitemModel.getItemDetail(db, stockitem_id, user_id, sttime);

            if(stockitem.is_add_today === null){
                stockitem.is_add_today = false
            }else{
                stockitem.is_add_today = true
            }

            return res.json({stockitem: stockitem});
        }catch(error){
            next(error);
        }
    },
    getMarketInfo: async(req, res, next) =>{
        const user_id = req.user.user_id;

        const cn = await db.connect();
        try{
            await cn.query('BEGIN');

            // 나의 관심종목 조회
            const myinterest = await stockitemModel.getMyinterest(cn, user_id);
            // 오늘 인기종목 조회
            const todaypopular = await stockitemModel.getTodaypopular(cn);
            // 오늘 추천종목 조회
            const todayrecommend = await stockitemModel.getTodayrecommend(cn);

            await cn.query('COMMIT');
            return res.json({myinterest:myinterest, todaypopular:todaypopular, todayrecommend:todayrecommend});
        }catch(error){
            await cn.query('ROLLBACK');
            next(error);
        }finally{
            cn.release();
        }
    },
}