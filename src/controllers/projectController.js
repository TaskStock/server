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
}