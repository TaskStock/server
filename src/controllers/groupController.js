const groupModel = require('../models/groupModel.js');

module.exports = {
    createGroup: async(req, res, next) =>{
        const {user_id, name, ispublic} = req.body;
        // user_id : 그룹장이 되는 유저아이디
        // name : 그룹 이름 - 그룹 이름 중복 허용?
        // ispublic : 그룹 공개 여부
        
        try{
            const u_group_id = await groupModel.ishaveGroup(user_id);
            if(u_group_id!==null){
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
    joinGroup: async(req, res, next) =>{
        const {user_id, group_id} = req.body;
        
        try{
            const u_group_id = await groupModel.ishaveGroup(user_id);
            const status = await groupModel.statusPeopleNum(group_id);
            if(u_group_id !== null){
                res.status(403).json({result: "fail", message: "그룹이 이미 있는 유저입니다."});
            }else if(status.people_maxnum < status.people_count){
                res.status(409).json({result: "fail", message: "해당 그룹의 인원이 가득 찼습니다."});
            }else{
                await groupModel.joinGroup(user_id, group_id);
                res.json({result: "success"});
            }
        }catch(error){
            next(error);
        }
    },
}