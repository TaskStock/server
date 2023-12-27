const valueModel = require('../models/valueModel.js');

module.exports = {
    createByNewUser: async(req, res, next) =>{
        const {user_id, region, date} = req.body;
        // date : 유저가 살고 있는 지역 기준의 날짜 (2023-12-27)
        
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
}