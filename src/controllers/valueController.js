const valueModel = require('../models/valueModel.js');

const transdate = require('../service/transdateService.js');

const db = require('../config/db.js');

module.exports = {
    createByNewUser: async(req, res, next) =>{
        const user_id = req.user.user_id;
        const region = req.user.region;
        
        try{
            const settlementTime = transdate.getSettlementTimeInUTC(region);

            await valueModel.createByNewUser(db, user_id, settlementTime);

            return res.json({result: "success"});
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
        const region = req.user.region;
        
        const cn = await db.connect();
        try{
            await cn.query('BEGIN');

            const recentValue = await valueModel.getRecentValue(cn, user_id);
            const start = recentValue.end;
            const end = start;
            const low = start;
            const high = start;

            const settlementTime = transdate.getSettlementTimeInUTC(region);

            await valueModel.createByExistUser(cn, user_id, settlementTime, start, end, low, high);

            await cn.query('COMMIT');
            return res.json({result: "success"});
        }catch(error){
            await cn.query('ROLLBACK');
            if(error.code === '23505'){ // 중복으로 인한 오류
                res.status(409).json({result: "fail", message: "이미 해당 날짜의 value가 존재합니다."});
            }else{
                next(error);
            }
        }finally{
            cn.release();
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
        
        const trans_start_date = transdate.getSettlementTime(start_date, region);
        const trans_end_date = transdate.getSettlementTime(end_date, region);

        if (isNaN(trans_start_date.getTime()) || isNaN(trans_end_date.getTime())) {
            return res.status(400).json({result: "fail", message: "잘못된 타임존입니다."});
        }
        
        try{
            const values = await valueModel.getValues(db, user_id, trans_start_date, trans_end_date);

            values.forEach( value =>{
                if(value.low<0){
                    value.low=0;
                }
            });

            return res.json({values: values});
        }catch(error){
            next(error);
        }
    },
}