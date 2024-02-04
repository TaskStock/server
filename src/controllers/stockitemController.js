const stockitemModel = require('../models/stockitemModel.js');
const sivalueModel = require('../models/sivalueModel.js');
const sistatisticsModel = require('../models/sistatisticsModel.js');

const transdate = require('../service/transdateService.js');

module.exports = {
    newItem: async(req, res, next) =>{
        const {name, level, region} = req.body;
        
        const db = req.dbClient;
        try{
            const stockitem_id = await stockitemModel.insertStockitem(db, name, level, region);

            const sttime = transdate.getSettlementTimeInUTC(region);
            await sivalueModel.createSivalue(db, stockitem_id, sttime);

            // 새로운 종목 생성 시 통계 테이블 자동 생성
            await sistatisticsModel.createSistatistics(db, stockitem_id);

            await db.query('COMMIT');
			return res.json({result: "success"});
        }catch(error){
            await db.query('ROLLBACK');
            next(error);
        }finally{
            db.release();
        }
    },
    updateItem: async(req, res, next) =>{
        const {stockitem_id, name, level} = req.body;
        
        const db = req.dbClient;
        try{
            await stockitemModel.updateStockitem(db, stockitem_id, name, level);

            await db.query('COMMIT');
			return res.json({result: "success"});
        }catch(error){
            await db.query('ROLLBACK');
            next(error);
        }finally{
            db.release();
        }
    },
    deleteItem: async(req, res, next) =>{
        const {stockitem_id} = req.body;
        
        const db = req.dbClient;
        try{
            await stockitemModel.deleteStockitem(db, stockitem_id);

            await db.query('COMMIT');
			return res.json({result: "success"});
        }catch(error){
            await db.query('ROLLBACK');
            next(error);
        }finally{
            db.release();
        }
    },
    getItems: async(req, res, next) =>{
        const db = req.dbClient;
        try{
            const stockitems = await stockitemModel.getStockitems(db);

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