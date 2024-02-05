const stockitemModel = require('../models/stockitemModel.js');

const transdate = require('../service/transdateService.js');

const db = require('../config/db.js');

module.exports = {
    getItemsMyinterest: async(req, res, next) =>{
        const user_id = req.user.user_id;

        try{
            const stockitems = await stockitemModel.getMyinterest(db, user_id);

            return res.json({stockitems: stockitems});
        }catch(error){
            next(error);
        }
    },
    getItemsTodaypopular: async(req, res, next) =>{
        try{
            const stockitems = await stockitemModel.getTodaypopular(db);

            return res.json({stockitems: stockitems});
        }catch(error){
            next(error);
        }
    },
    getItemsTodayrecommend: async(req, res, next) =>{
        try{
            const stockitems = await stockitemModel.getTodayrecommend(db);

            return res.json({stockitems: stockitems});
        }catch(error){
            next(error);
        }
    },
    getItemsAll: async(req, res, next) =>{
        const user_id = req.user.user_id;
        const region = req.user.region;

        try{
            const sttime = transdate.getSettlementTimeInUTC(region);

            const stockitems = await stockitemModel.getAll(db, sttime, user_id);

            return res.json({stockitems: stockitems});
        }catch(error){
            next(error);
        }
    },
    getItem: async(req, res, next) =>{
        const stockitem_id = req.params.stockitem_id;
        const user_id = req.user.user_id;

        try{
            const stockitem = await stockitemModel.getItemDetail(db, stockitem_id, user_id);

            return res.json({stockitem: stockitem});
        }catch(error){
            next(error);
        }
    },
}