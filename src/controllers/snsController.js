const snsModel = require('../models/snsModel.js');
const accountModel = require('../models/accountModel.js');

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
        const rankingResult = await snsModel.showRanking();
        if (rankingResult) {
            res.status(200).json({
                result: "success",
                rankingResult: rankingResult
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
        const followResult = await snsModel.followUser(follower_id, following_id);

        if (followResult) {
            res.status(200).json({
                result: "success"
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
        const searchTarget = req.body.searchTarget; //이메일 또는 닉네임
        const searchScope = req.body.searchScope; //검색 범위
        const user_id = req.user.user_id;

        const searchResult = await snsModel.searchUser(searchTarget, searchScope, user_id);
        res.status(200).json({
            result: "success",
            searchResult: searchResult
        });
    },
    showFollowList: async(req, res) => {
        const user_id = req.user.user_id;

        const followList = await snsModel.showFollowList(user_id);
        res.status(200).json({
            result: "success",
            followList: followList
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
    }

}
;