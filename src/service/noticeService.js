const noticeModel = require('../models/noticeModel.js');
const accountModel = require('../models/accountModel.js');

module.exports = {
    // TODO : 알림 DB에 추가. user_id, content, notice_type => noticeData에 넣어서 전달
    processNotice: async (predata) => {
        let noticeData = {
            user_id: predata.user_id,
            content: '',
            type: predata.type,
            info: ''
        };
        
        if (predata.type === 'sns.follow') {
            followerData = await accountModel.getUserById(predata.follower_id);
            if (predata.pending === false)
                noticeData.content = `${noticeData.user_name}님이 팔로우를 시작했습니다.`;
            else {
                noticeData.content = `${noticeData.user_name}님이 팔로우 요청을 보냈습니다.`;
            }
            noticeData.info = JSON.stringify({
                isFollowingMe: predata.isFollowingMe,
                isFollowingYou: predata.isFollowingYou,
                pending: predata.pending
            });
        }

        if (predata.notice_type === 'sns.accept') {
            noticeData.content = `${noticeData.user_name}님이 팔로우 요청을 수락했습니다.`;
        }

        await noticeModel.createNotice(noticeData);
    }
};