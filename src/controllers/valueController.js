const valueModel = require('../models/valueModel.js');

module.exports = {
    createByNewUser: async(req, res, next) =>{
        const {user_id, region, date} = req.body;
        // date : 유저가 살고 있는 지역 기준의 날짜 (2023-12-27)
        // region에 따른 date 변환 필요
        
        try{
            await valueModel.createByNewUser(user_id, date);
            res.json({result: "success"});
        }catch(error){
            if(error.code === '23505'){ // 중복으로 인한 오류
                res.status(409).json({result: "fail", message: "이미 해당 날짜의 value가 존재합니다."});
            }else{
                next(error);
            }
        }
    },
    createByExistUser: async(req, res, next) =>{
        const {user_id, region, date} = req.body;
        // date : 유저가 살고 있는 지역 기준의 날짜 (2023-12-27)
        // region에 따른 date 변환 필요
        
        try{
            const recentValue = await valueModel.getRecentValue(user_id, date);
            const start = recentValue.end;
            const end = start;
            const low = start;
            const high = start;
            const percentage = null;    // 계산 로직 필요
            const combo = 0;    // 계산 로직 필요

            await valueModel.createByExistUser(user_id, date, percentage, start, end, low, high, combo);
            res.json({result: "success"});
        }catch(error){
            if(error.code === '23505'){ // 중복으로 인한 오류
                res.status(409).json({result: "fail", message: "이미 해당 날짜의 value가 존재합니다."});
            }else{
                next(error);
            }
        }
    },
    getValues: async(req, res, next) =>{
        const {user_id, region, start_date, end_date} = req.body;
        // start_date : 가져올 시작 날짜
        // end_date : 가져올 끝 날짜
        // ex. start_date="2023-12-26", end_date="2023-12-28" => 26일~28일 전부 가져옴
        // region에 따른 date 변환 필요
        
        try{
            const values = await valueModel.getValues(user_id, start_date, end_date);
            res.json({values: values});
        }catch(error){
            next(error);
        }
    },
}