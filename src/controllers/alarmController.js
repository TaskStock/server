const alarmModel = require('../models/alarmModel.js');

module.exports = {
    // 임시로 만든 컨트롤러
    createAlarm: async(req, res, next) =>{
        const {user_id, content} = req.body;
        
        try{
            await alarmModel.insertAlarm(user_id, content);
        }catch(error){
            next(error);
        }
        
        res.json({result: "success"});
    },
    readAllAlarms: async(req, res, next) =>{
        const {user_id} = req.body;
        
        try{
            const alarms = await alarmModel.readAlarms(user_id);
            
            res.json({alarms: alarms});
        }catch(error){
            next(error);
        }
    },
    readAlarm: async(req, res, next) =>{
        const {alarm_id, user_id} = req.body;
        
        try{
            const alarm = await alarmModel.readAlarmAndUpdateIsread(alarm_id, user_id);
        
            res.json({alarm: alarm});
        }catch(error){
            next(error);
        }
    },
}