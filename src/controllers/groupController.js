const groupModel = require('../models/groupModel.js');

module.exports = {
    createGroup: async(req, res, next) =>{
        const {user_id, name, ispublic} = req.body;
        // user_id : 그룹장이 되는 유저아이디
        // name : 그룹 이름 - 그룹 이름 중복 허용?
        // ispublic : 그룹 공개 여부
        
        try{
            const group_id = await groupModel.ishaveGroup(user_id);
            if(group_id!==null){
                res.status(403).json({result: "fail", message: "그룹이 이미 있는 유저입니다."});
            }else{
                await groupModel.insertGroup(user_id, name, ispublic);
                res.json({result: "success"});
            }
        }catch(error){
            if(error.code === '23505'){ // 중복으로 인한 오류
                res.status(409).json({result: "fail", message: "그룹은 여러개 생성할 수 없습니다."});
            }else{
                next(error);
            }
        }
    },
}