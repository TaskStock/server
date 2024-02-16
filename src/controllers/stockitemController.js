const stockitemModel = require('../models/stockitemModel.js');
const sivalueModel = require('../models/sivalueModel.js');
const sistatisticsModel = require('../models/sistatisticsModel.js');

const transdate = require('../service/transdateService.js');

const db = require('../config/db.js');

module.exports = {
    newItem: async(req, res, next) =>{
        const {name, level, region} = req.body;
        
        const cn = await db.connect();
        try{
            await cn.query('BEGIN');

            const stockitem_id = await stockitemModel.insertStockitem(cn, name, level, region);

            const sttime = transdate.getSettlementTimeInUTC(region);
            await sivalueModel.createSivalue(cn, stockitem_id, sttime);

            // 새로운 종목 생성 시 통계 테이블 자동 생성
            await sistatisticsModel.createSistatistics(cn, stockitem_id);

            await cn.query('COMMIT');
			return res.json({result: "success"});
        }catch(error){
            await cn.query('ROLLBACK');
            next(error);
        }finally{
            cn.release();
        }
    },
    updateItem: async(req, res, next) =>{
        const {stockitem_id, name, level} = req.body;
        
        try{
            await stockitemModel.updateStockitem(db, stockitem_id, name, level);

			return res.json({result: "success"});
        }catch(error){
            next(error);
        }
    },
    deleteItem: async(req, res, next) =>{
        const {stockitem_id} = req.body;
        
        try{
            await stockitemModel.deleteStockitem(db, stockitem_id);

			return res.json({result: "success"});
        }catch(error){
            next(error);
        }
    },
    getItems: async(req, res, next) =>{
        try{
            const stockitems = await stockitemModel.getStockitems(db);

            return res.json({stockitems: stockitems});
        }catch(error){
            next(error);
        }
    },
}