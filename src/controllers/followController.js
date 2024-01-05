const followModel = require('../models/followModel.js');
const accountModel = require('../models/accountModel.js');

module.exports = {
    follow: async(req, res, next) =>{
        const {user_id, followed_id} = req.body;
        // user_id
        // followed_id : 팔로우하는 사람의 user_id
        
        try{
            await followModel.newMapping(user_id, followed_id);
            res.json({result: "success"});
        }catch(error){
            if(error.code === '23505'){ // 중복으로 인한 오류
                res.status(409).json({result: "fail", message: "duplicate"});
            }else{
                next(error);
            }
        }
    },
    unfollow: async(req, res, next) =>{
        const {user_id, unfollowed_id} = req.body;
        // user_id
        // unfollowed_id : 언팔로우하는 사람의 user_id
        
        try{
            await followModel.deleteMapping(user_id, unfollowed_id);
            res.json({result: "success"});
        }catch(error){
            next(error);
        }
    },
    getProfile: async(req, res, next) =>{
        const {user_id} = req.body;
        // user_id : 열람하고자 하는 상대방 프로필

        let user;
        try{
            user = await accountModel.getUserById(user_id);
        }catch(error){
            next(error);
        }

        if(user.length === 0){  // 찾은 유저가 없을 경우
            res.json({result: "fail", message: "no user"});
        }else{
            if(user[0].hide === true){  // 비공개계정 - 삭제 필드 의논 필요
                delete user[0].user_id;
                delete user[0].email;
                delete user[0].password;
                delete user[0].hide;
                delete user[0].follower_count;
                delete user[0].following_count;
                delete user[0].premium;
            }else{  // 공개계정
                delete user[0].user_id;
            }
            res.json({user: user});
            // {
            //     user_id: 1,
            //     email: 'testid',
            //     password: 'tpwd',
            //     user_name: 'test',
            //     hide: false,
            //     follower_count: 0,
            //     following_count: 0,
            //     premium: 0,
            //     cumulative_value: 0,
            //     value_month_ago: 0,
            //     created_time: 2023-12-23T21:45:20.624Z,
            //     image: null,
            //     introduce: null,
            //     group_id: null,
            //     is_agree: null
            //   }
        }
    },
}