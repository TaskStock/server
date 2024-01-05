const valueModel = require('../models/valueModel.js');
const { zonedTimeToUtc } = require('date-fns-tz');

module.exports = {
    createByNewUser: async(req, res, next) =>{
        const user_id = req.user.user_id;
        // 생성할 때는 db 기준(utc) 현재 시간을 저장
        
        try{
            await valueModel.createByNewUser(user_id);
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
        const user_id = req.user.user_id;
        
        try{
            const recentValue = await valueModel.getRecentValue(user_id);
            const start = recentValue.end;
            const end = start;
            const low = start;
            const high = start;
            const percentage = null;    // 계산 로직 필요
            const combo = 0;    // 계산 로직 필요

            await valueModel.createByExistUser(user_id, percentage, start, end, low, high, combo);
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
        const start_date = req.query.start_date;
        const end_date = req.query.end_date;
        // start_date : 가져올 시작 날짜
        // end_date : 가져올 끝 날짜
        // ex. start_date="2023-12-26", end_date="2023-12-28" => 26일~27일 전부 가져옴
        const user_id = req.user.user_id;
        const region = req.user.region;
        
        const trans_start_date = zonedTimeToUtc(new Date(`${start_date}T00:00:00`), region);
        const trans_end_date = zonedTimeToUtc(new Date(`${end_date}T00:00:00`), region);

        if (isNaN(trans_start_date.getTime()) || isNaN(trans_end_date.getTime())) {
            return res.status(400).json({result: "fail", message: "잘못된 타임존입니다."});
        }
        
        try{
            const values = await valueModel.getValues(user_id, trans_start_date, trans_end_date);
            res.json({values: values});
        }catch(error){
            next(error);
        }
    },
}