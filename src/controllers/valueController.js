const valueModel = require('../models/valueModel.js');
const { zonedTimeToUtc, utcToZonedTime } = require('date-fns-tz');
const { startOfDay, addHours } = require('date-fns');

module.exports = {
    createByNewUser: async(req, res, next) =>{
        const user_id = req.user.user_id;
        // 생성할 때는 db 기준(utc) 현재 시간을 저장
        
        try{
            const nowUtc = new Date();  // 로컬 시간대를 반영한 utc 생성
            const startOfToday = startOfDay(nowUtc); // utc이지만 로컬 시간대에 맞는 시작일을 제대로 구하고 있음
            const sixAMToday = addHours(startOfToday, 6);   // 정산시간(6시)
            let result;
            if (nowUtc >= sixAMToday) {
                result = sixAMToday;
            } else {
                result = addHours(sixAMToday, -24);
            }

            await valueModel.createByNewUser(user_id, result);
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
        
        const trans_start_date = new Date(`${start_date} 06:00:00`);
        const trans_end_date = new Date(`${end_date} 06:00:00`);

        if (isNaN(trans_start_date.getTime()) || isNaN(trans_end_date.getTime())) {
            return res.status(400).json({result: "fail", message: "잘못된 타임존입니다."});
        }
        
        try{
            const values = await valueModel.getValues(user_id, trans_start_date, trans_end_date);

            for(let i=0;i<values.length;i++){
                const utcdate = new Date(values[i].date);    // 이미 로컬 시간대가 적용됨?
                const trans_date = utcToZonedTime(utcdate, region); // 이 코드가 필요한지 모르겠음
                values[i].date=trans_date.toLocaleDateString('en-CA');
            }

            res.json({values: values});
        }catch(error){
            next(error);
        }
    },
}