const stockitemModel = require('../models/stockitemModel.js');
const sivalueModel = require('../models/sivalueModel.js');

const transdate = require('../service/transdateService.js');

module.exports = {
    newItem: async(req, res, next) =>{
        const {name, level, region} = req.body;
        
        try{
            const stockitem_id = await stockitemModel.insertStockitem(name, level, region);

            const sttime = transdate.getSettlementTimeInUTC(region);
            await sivalueModel.createSivalue(stockitem_id, sttime);
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