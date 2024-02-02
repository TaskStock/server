const stockitemModel = require('../models/stockitemModel.js');
const sivalueModel = require('../models/sivalueModel.js');
const sistatisticsModel = require('../models/sistatisticsModel.js');

const transdate = require('../service/transdateService.js');

module.exports = {
    newItem: async(req, res, next) =>{
        const {name, level, region} = req.body;
        
        try{
            const stockitem_id = await stockitemModel.insertStockitem(name, level, region);

            const sttime = transdate.getSettlementTimeInUTC(region);
            await sivalueModel.createSivalue(stockitem_id, sttime);

            // 새로운 종목 생성 시 통계 테이블 자동 생성
            await sistatisticsModel.createSistatistics(stockitem_id);
        }catch(error){
            next(error);
        }
    
        res.json({result: "success"});
    },
    updateItem: async(req, res, next) =>{
        const {stockitem_id, name, level} = req.body;
        
        try{
            await stockitemModel.updateStockitem(stockitem_id, name, level);
        }catch(error){
            next(error);
        }
    
        res.json({result: "success"});
    },
    deleteItem: async(req, res, next) =>{
        const {stockitem_id} = req.body;
        
        try{
            await stockitemModel.deleteStockitem(stockitem_id);
        }catch(error){
            next(error);
        }
    
        res.json({result: "success"});
    },
    getItems: async(req, res, next) =>{
        
        try{
            const stockitems = await stockitemModel.getStockitems();

            return res.json({stockitems: stockitems});
        }catch(error){
            next(error);
        }
    
        res.json({result: "success"});
    },
}