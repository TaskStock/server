const alarmModel = require('../models/alarmModel.js');

module.exports = {
    createAlarm: async(req, res, next) =>{
        const {user_id, content} = req.body;
        
        try{
            await alarmModel.insertAlarm(user_id, content);
        }catch(error){
            next(error);
        }
        
        res.json({result: "success"});
    },
}