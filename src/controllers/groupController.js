const groupModel = require('../models/groupModel.js');

module.exports = {
    createGroup: async(req, res, next) =>{
        const {name, ispublic} = req.body;
        // user_id : 그룹장이 되는 유저아이디
        // name : 그룹 이름 - 그룹 이름 중복 허용?
        // ispublic : 그룹 공개 여부
        const user_id = req.user.user_id;
        
        try{
            const group_id = await groupModel.insertGroup(user_id, name, ispublic);
            await groupModel.joinGroup(user_id, group_id);
            return res.json({result: "success"});
        }catch(error){
            if(error.code === '23505'){ // 중복으로 인한 오류
                return res.status(409).json({result: "fail", message: "이미 똑같은 이름의 그룹이 존재합니다."});
            }else{
                next(error);
            }
        }
    },
    joinGroup: async(req, res, next) =>{
        const {group_id} = req.body;
        const user_id = req.user.user_id;
        
        try{
            const isHaveGroup = await groupModel.getUserGroupId(user_id, group_id);
            const status = await groupModel.statusPeopleNum(group_id);
            
            if(status === undefined){
                return res.status(400).json({result: "fail", message: "존재하지 않는 그룹입니다."});
            }else if(isHaveGroup !== undefined){
                return res.status(403).json({result: "fail", message: "그룹에 이미 있는 유저입니다."});
            }else if(status.people_maxnum <= status.people_count){
                return res.status(409).json({result: "fail", message: "해당 그룹의 인원이 가득 찼습니다."});
            }else{
                await groupModel.joinGroup(user_id, group_id);
                return res.json({result: "success"});
            }
        }catch(error){
            next(error);
        }
    },
    getRank: async(req, res, next) =>{
        const {group_id} = req.body;
        
        try{
            const groupHead = await groupModel.getHeadId(group_id);
            if(groupHead === undefined){
                return res.status(400).json({result: "fail", message: "존재하지 않는 그룹입니다."});
            }

            const ranking = await groupModel.groupRanking(group_id);
            return res.json({rank: ranking});
        }catch(error){
            next(error);
        }
    },
    changeHead: async(req, res, next) =>{
        const {group_id, to_id} = req.body;
        // user_id : 원래 그룹장인 유저
        // to_id : 새로 그룹장이 될 유저
        const user_id = req.user.user_id;

        if(user_id === to_id){
            return res.status(400).json({result: "fail", message: "서로 다른 유저를 지정해주세요."});
        }
        
        try{
            const now_head_id = await groupModel.getHeadId(group_id);
            if(now_head_id === undefined){
                return res.status(400).json({result: "fail", message: "존재하지 않는 그룹입니다."});
            }
            const isHaveGroup = await groupModel.getUserGroupId(to_id, group_id);
            if(now_head_id.user_id !== user_id){    // 그룹장이 아닌 경우
                return res.status(400).json({result: "fail", message: "그룹장만 그룹장을 바꿀 수 있습니다."});
            }else if(isHaveGroup === undefined){  // 새로운 그룹장이 그룹원이 아닌 경우
                return res.status(400).json({result: "fail", message: "그룹원만 그룹장으로 임명할 수 있습니다."});
            }else{
                await groupModel.updateHead(group_id, to_id);
                return res.json({result: "success"});
            }
        }catch(error){
            next(error);
        }
    },
    deleteGroup: async(req, res, next) =>{
        const {group_id} = req.body;
        const user_id = req.user.user_id;
        
        try{
            const now_head_id = await groupModel.getHeadId(group_id);
            if(now_head_id === undefined){
                return res.status(400).json({result: "fail", message: "존재하지 않는 그룹입니다."});
            }else if(now_head_id.user_id !== user_id){    // 그룹장이 아닌 경우
                return res.status(400).json({result: "fail", message: "그룹장만 그룹을 삭제할 수 있습니다."});
            }else{
                await groupModel.deleteGroup(group_id, user_id);
                await groupModel.deleteUserGroupId(group_id, user_id);
                return res.json({result: "success"});
            }
        }catch(error){
            next(error);
        }
    },
}