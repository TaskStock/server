const snsModel = require('../models/snsModel.js');

module.exports = {
    changePrivate: async(req, res) => {
        user_id = req.user.user_id;
        const private = req.body.private;
        const changeResult = await snsModel.changePrivate(user_id, private);
        if (changeResult) {
            res.status(200).json({
                result: "success"
            });
        } else {
            res.status(400).json({
                result: "fail"
            });
        }
    },
    showRanking: async(req, res) => {
        const user_id = req.user.user_id;
        const rankingResult = await snsModel.showRanking(user_id);
        if (rankingResult) {
            res.status(200).json({
                result: "success",
                rankingAll: rankingResult[0],
                rankingFollower: rankingResult[1],
                rankingFollowing: rankingResult[2]
            });
        } else {
            res.status(400).json({
                result: "fail"
            });
        }
    },
    followUser: async(req, res) => {
        const follower_id = req.user.user_id;
        const following_id = req.body.following_id;
        const [followResult, pending, isFollowingMe, isFollowingYou] = await snsModel.followUser(follower_id, following_id);

        if (followResult) {
            res.status(200).json({
                result: "success",
                pending: pending,
                isFollowingMe: isFollowingMe,
                isFollowingYou: isFollowingYou
            });
        } else {
            res.status(400).json({
                result: "fail"
            });
        }
    },
    unfollowUser: async(req, res) => {
        const follower_id = req.user.user_id;
        const unfollowing_id = req.body.unfollowing_id;
        const unfollowResult = await snsModel.unfollowUser(follower_id, unfollowing_id);

        if (unfollowResult) {
            res.status(200).json({
                result: "success"
            });
        } else {
            res.status(400).json({
                result: "fail"
            });
        }
    },
    searchUser: async(req, res) => {
        try {
        const searchTarget = req.query.searchTarget; //이메일 또는 닉네임
        const searchScope = req.query.searchScope; //검색 범위
        const user_id = req.user.user_id;
        console.log(searchTarget, searchScope, user_id)

        const searchResult = await snsModel.searchUser(searchTarget, searchScope, user_id);
        return res.status(200).json({
            result: "success",
            searchResult: searchResult
        })
    } catch (err) {
        console.log(err)
        return res.status(500).json({
            result: "fail",
            message: "서버 내부 오류"
        })
    }},
    showFollowList: async(req, res) => {
        const user_id = req.user.user_id;

        const [followerList, followingList] = await snsModel.showFollowList(user_id);

        res.status(200).json({
            result: "success",
            followerList: followerList,
            followingList: followingList
        });
    },
    editUserInfo: async(req, res) => {
        const user_id = req.user.user_id;
        const user_name = req.body.user_name;
        const introduce = req.body.introduce;

        const editResult = await snsModel.editUserInfo(user_id, user_name, introduce);
        if (editResult) {
            res.status(200).json({
                result: "success"
            });
        } else {
            res.status(400).json({
                result: "fail"
            });
        }
    },
    editUserImage: async(req, res) => {
        const user_id = req.user.user_id;
        const image_file = req.file
        if (image_file == undefined) {
            console.log('이미지 파일이 없습니다.');
            return res.status(400).json({
                message: "이미지 파일이 없습니다.",
                result: "fail"
            });
        } else { 
            image_path = image_file.path;
        }

        const uploadResult = await snsModel.editUserImage(user_id, image_path);
        if (uploadResult) {
            console.log("이미지 변경 완료");
            return res.status(200).json({
                result: "success",
                imagePath : image_path
            });
        } else {
            console.log("이미지 변경 실패");
            return res.status(500).json({
                result: "fail"
            });
        }
    },
    acceptPenging: async(req, res) => {
        const following_id = req.user.user_id;
        const follower_id = req.body.follower_id;
        const acceptResult = await snsModel.acceptPending(follower_id, following_id);
        
        if (acceptResult) {
            res.status(200).json({
                result: "success"
            });
        } else {
            res.status(400).json({
                result: "fail"
            });
        }
    },
    changeDefaultImage: async(req, res) => {
        const user_id = req.user.user_id;
        const changeResult = await snsModel.changeDefaultImage(user_id);
        
        if (changeResult) {
            res.status(200).json({
                result: "success",
                imagePath: 'public/images/ic_profile.png'
            });
        } else {
            res.status(500).json({
                result: "fail"
            });
        }
    },
    cancelFollow: async(req, res) => {
        const follower_id = req.user.user_id;
        const following_id = req.body.following_id;
        const cancelResult = await snsModel.cancelFollow(follower_id, following_id);
        
        if (cancelResult == true) {
            return res.status(200).json({
                result: "success"
            });
        } else if (cancelResult == false) {
            return res.status(500).json({
                result: "fail"
            });
        } else if (cancelResult == 'alreadyAccepted') {
            return res.status(400).json({
                result: "alreadyAccepted"
            });
        } 
    },
    /* TODO:
    {private : true or false
    user_name (사용자 이름)
    cumulative_value (현재 가치)
    start_value (시작가) }
    following_cnt
    follower_cnt
    pending
    isFollowingMe
    isFollowingYou
    "values": [ { "value_id": 16, "date": "2024-01-03T15:45:27.160Z", "percentage": null, "start": 50000, "end": 50000, "low": 50000, "high": 50000, "combo": 0, "user_id": 75 }, { "value_id": 18, "date": "2024-01-03T15:47:25.330Z", "percentage": null, "start": 50000, "end": 50000, "low": 50000, "high": 50000, "combo": 0, "user_id": 75 } ] }}
    "todos": [ { "todo_id": 535, "content": "content", "check": false, "date": "2024-01-11T21:04:00.000Z", "level": 1, "index": 1, "user_id": 122, "project_id": null }, { "todo_id": 536, "content": "content", "check": false, "date": "2024-01-11T21:04:00.000Z", "level": 1, "index": 2, "user_id": 122, "project_id": null } ]  
    "projects": [ { "project_id": 9, "name": "project1", "public_range": “none”, "user_id": 126, "todo_count": 1, "retrospect_count": 2 }, { "project_id": 13, "name": "project1", "public_range": “none”, "user_id": 126, "todo_count": 0, "retrospect_count": 0 } ]
     */
    userDetail: async(req, res) => {
        try {
        const my_id = req.user.user_id;
        const target_id = req.params.user_id;

        [targetData, values, todos, projects] = await snsModel.userDetail(my_id, target_id)
        return res.status(200).json({
            result: "success",
            targetData: targetData,
            values: values,
            todos: todos,
            projects: projects
        })
        } catch (e) {
            console.log(e)
            return res.status(500).json({
                result: "fail",
                message: "서버 내부 오류"
            })
        }
    }
}