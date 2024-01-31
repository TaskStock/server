const noticeModel = require('../models/noticeModel.js');
const accountModel = require('../models/accountModel.js');
const admin = require('../config/FCMconfig.js');
const slackClient = require('../config/slackConfig.js');

module.exports = {
    // TODO : 알림 DB에 추가. user_id, content, notice_type => noticeData에 넣어서 전달
    processNotice: async (predata) => {
        let noticeData = {
            user_id: predata.user_id,
            content: '',
            type: predata.type,
            info: ''
        };
        
        if (predata.type === 'sns') {
            follower_name = await accountModel.getUserNameById(predata.follower_id);
            if (predata.pending === false)
                noticeData.content = `${follower_name}님이 팔로우를 시작했습니다.`;
            else {
                noticeData.content = `${follower_name}님이 팔로우 요청을 보냈습니다.`;
            }
            noticeData.info = JSON.stringify({
                target_id: predata.follower_id,
                isFollowingMe: predata.isFollowingMe,
                isFollowingYou: predata.isFollowingYou,
                pending: predata.pending
            });
        }

        if (predata.type === 'general') {
            following_name = await accountModel.getUserNameById(predata.following_id);
            noticeData.content = `${following_name}님이 팔로우 요청을 수락했습니다.`;
            noticeData.info = JSON.stringify({
                target_id: predata.following_id
            });
        }

        await noticeModel.createNotice(noticeData);
    },
    // TODO : FCM 푸시 알림 전송
    sendPush: async (noticeData) => {
        const { user_id, content, type, info } = noticeData;
        const queryResult = await accountModel.getUserById(user_id);
        const userData = queryResult[0]
        const targetToken = await noticeModel.getFCMToken(user_id); // 푸시메세지를 받을 유저의 FCM 토큰
    
        let message = {
            notification: {
                title: '새 메시지가 도착했습니다',
                body: '여기에 메시지 내용을 넣으세요'
            },
            
            data: {
                title: '테스트 데이터 발송',
                body: 'notification과 data의 차이가 뭐지?',
                style: '굳굳',
            },
            token: targetToken,
        }

        admin
            .messaging()
            .send(message)
            .then(function (response) {
                console.log('Successfully sent message: : ', response)
            })
            .catch(function (err) {
                console.log('Error Sending message!!! : ', err)
            })

    },
    // TODO : 타입에 따라 슬랙 메세지 전송
    sendSlack: async (noticeData) => {
        let message = "";
        if (noticeData.type === 'customer.suggestion') {
            const user_name = await accountModel.getUserNameById(noticeData.user_id);
            const content = noticeData.content;
            message = `*${user_name}*님이 고객센터에 새로운 의견을 남겼습니다.\n\n${content}`;

            await slackClient.chat.postMessage({
                channel: '#고객의견',
                text: message
            })
            return
        } 

        if (noticeData.type === 'error') {
            // const message
        }
    } 
};