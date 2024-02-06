const sivalueModel = require('../models/sivalueModel.js');

const transdate = require('../service/transdateService.js');

const db = require('../config/db.js');

module.exports = {
    getSIValueOnemonth: async(req, res, next) =>{
        const stockitem_id = req.params.stockitem_id;

        const region = req.user.region;

        try{
            const sttime = transdate.getSettlementTimeInUTC(region);
            const previousMonth = transdate.minusOneMonth(sttime, region);

            const sivalues = await sivalueModel.getSivalueOnemonth(db, stockitem_id, previousMonth, sttime);

            return res.json({sivalues: sivalues});
        }catch(error){
            next(error);
        }
    },
}