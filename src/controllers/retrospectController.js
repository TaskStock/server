const retrospectModel = require('../models/retrospectModel.js');

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
            await retrospectModel.updateProject(retrospect_id, user_id, content);
        }catch(error){
            next(error);
        }
    
        res.json({result: "success"});
    },
    deleteRetrospect: async(req, res, next) =>{
        const {retrospect_id} = req.body;
        const user_id = req.user.user_id;
        
        try{
            await retrospectModel.deleteTodo(retrospect_id, user_id);
        }catch(error){
            next(error);
        }
    
        res.json({result: "success"});
    }
}