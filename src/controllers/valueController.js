const valueModel = require('../models/valueModel.js');

const transdate = require('../service/transdateService.js');

module.exports = {
    createByNewUser: async(req, res, next) =>{
        const user_id = req.user.user_id;
        const region = req.user.region;
        // 생성할 때는 로컬 기준 정산시간(06시) 를 utc로 변환하여 저장
        
        const db = req.dbClient;
        try{
            const settlementTime = transdate.getSettlementTimeInUTC(region);

            await valueModel.createByNewUser(db, user_id, settlementTime);

            await db.query('COMMIT');
            return res.json({result: "success"});
        }catch(error){
            await db.query('ROLLBACK');
            if(error.code === '23505'){ // 중복으로 인한 오류
                res.status(409).json({result: "fail", message: "이미 해당 날짜의 value가 존재합니다."});
            }else{
                next(error);
            }
        }finally{
            db.release();
        }
    },
    createByExistUser: async(req, res, next) =>{
        const user_id = req.user.user_id;
        const region = req.user.region;
        
        const db = req.dbClient;
        try{
            const recentValue = await valueModel.getRecentValue(db, user_id);
            const start = recentValue.end;
            const end = start;
            const low = start;
            const high = start;

            const settlementTime = transdate.getSettlementTimeInUTC(region);

            await valueModel.createByExistUser(db, user_id, settlementTime, start, end, low, high);

            await db.query('COMMIT');
            return res.json({result: "success"});
        }catch(error){
            await db.query('ROLLBACK');
            if(error.code === '23505'){ // 중복으로 인한 오류
                res.status(409).json({result: "fail", message: "이미 해당 날짜의 value가 존재합니다."});
            }else{
                next(error);
            }
        }finally{
            db.release();
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
            await db.query('ROLLBACK');
            return res.status(400).json({result: "fail", message: "잘못된 타임존입니다."});
        }
        
        const db = req.dbClient;
        try{
            const values = await valueModel.getValues(db, user_id, trans_start_date, trans_end_date);

            await db.query('COMMIT');
            return res.json({values: values});
        }catch(error){
            await db.query('ROLLBACK');
            next(error);
        }finally{
            db.release();
        }
    },
}