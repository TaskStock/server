const projectModel = require('../models/projectModel.js');

module.exports = {
    newProject: async(req, res, next) =>{
        const {user_id, name, ispublic} = req.body;
        
        try{
            await projectModel.insertProject(user_id, name, ispublic);
        }catch(error){
            next(error);
        }
    
        res.json({result: "success"});
    },
    updateProject: async(req, res, next) =>{
        const {project_id, user_id, name, ispublic} = req.body;
        
        try{
            await projectModel.updateProject(project_id, user_id, name, ispublic);
        }catch(error){
            next(error);
        }
    
        res.json({result: "success"});
    },
}