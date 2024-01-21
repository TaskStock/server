const retrospectModel = require('../models/retrospectModel.js');

const transdate = require('../service/transdateService.js');

module.exports = {
    newRetrospect: async(req, res, next) =>{
        const {project_id, content} = req.body;
        const user_id = req.user.user_id;
        
        try{
            await retrospectModel.insertRetrospect(project_id, content, user_id);
        }catch(error){
            next(error);
        }
    
        res.json({result: "success"});
    },
    updateRetrospect: async(req, res, next) =>{
        const {retrospect_id, content} = req.body;
        const user_id = req.user.user_id;
        
        try{
            await retrospectModel.updateRetrospect(retrospect_id, user_id, content);
        }catch(error){
            next(error);
        }
    
        res.json({result: "success"});
    },
    deleteRetrospect: async(req, res, next) =>{
        const {retrospect_id} = req.body;
        const user_id = req.user.user_id;
        
        try{
            await retrospectModel.deleteRestrospect(retrospect_id, user_id);
        }catch(error){
            next(error);
        }
    
        res.json({result: "success"});
    },
    getRetrospectsWithMonth: async(req, res, next) =>{
        const date = req.query.date;

        const user_id = req.user.user_id;
        const region = req.user.region;
        
        try{
            const start_date = transdate.getStartOfMonthTime(date, region);
            const end_date = transdate.getNextMonthTime(date, region);

            const retrospects = await retrospectModel.getRetrospectsWithMonth(user_id, start_date, end_date);

            return res.json({retrospects: retrospects});
        }catch(error){
            next(error);
        }
    
        res.json({result: "success"});
    }
}