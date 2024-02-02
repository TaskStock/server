const noticeModel = require('../models/noticeModel.js');
const accountModel = require('../models/accountModel.js');
const admin = require('../config/FCMconfig.js');
const slackClient = require('../config/slackConfig.js');

module.exports = {
    // TODO : 알림 DB에 추가. user_id, content, notice_type => noticeData에 넣어서 전달
    processNotice: async (predata) => {
        let noticeData = {
            user_id: predata.user_id, // 알림을 받을 사람 ID
            content: '', // 알림 내용
            type: predata.type, // 알림 타입
            info: '' // 알림 터치 등 동작 구현을 위한 추가 정보
        };
        let displayAccept;
        
        if (noticeData.type === 'sns') {
            let follower_name = await accountModel.getUserNameById(predata.follower_id);
            if (predata.followerPending === false) { // 팔로우 당한 사람이 공개 계정일 때
                noticeData.content = `${follower_name}님이 팔로우를 시작했습니다.`;
                displayAccept = false;
            } else { // 상대가 비공개 계정일 때
                noticeData.content = `${follower_name}님이 팔로우 요청을 보냈습니다.`;
                displayAccept = true;
            }
            noticeData.info = JSON.stringify({
                target_id: predata.follower_id, // 팔로우 요청한 사람 ID
                isFollowingYou: predata.isFollowingYou, // 팔로우 당한 사람 입장 isFollowingYou
                isFollowingMe: predata.isFollowingMe, // 팔로우 당한 사람 입장 isFollowingMe
                pending: predata.followingPending, // 팔로우 당한 사람 입장 pending
                displayAccept: displayAccept, // 팔로우 당한 사람 입장 displayAccept
                private: predata.private // 팔로우 한 사람 입장 private
            });
        }

        if (noticeData.type === 'general') {
            let following_name = await accountModel.getUserNameById(predata.following_id);
            noticeData.content = `${following_name}님이 팔로우 요청을 수락했습니다.`;

            noticeData.info = JSON.stringify({
                target_id: predata.following_id
            });
        }
        await noticeModel.createNotice(noticeData);
    },
    // TODO : FCM 푸시 알림 전송
    sendPush: async (noticeData) => {
        const user_id = noticeData.user_id; // 알림 받을 상대의 user_id
        
        const token = await noticeModel.getFCMToken(user_id); // 푸시메세지를 받을 유저의 FCM 토큰
        if (token.length == 0) {
            console.log('FCM토큰이 0개일 경우 알림 발송 안함')
            return
        
        }
        let title = '\uD83D\uDCC8 TASKSTOCK';
        let body = '';
        let target_id;
        if (noticeData.type === 'sns') {
            let follower_name = await accountModel.getUserNameById(noticeData.follower_id)
            target_id = toString(noticeData.follower_id)
            if (noticeData.followerPending === false) { // 팔로우 당한 사람이 공개 계정
                body = `${follower_name}님이 팔로우를 시작했습니다.`;
            } else { // 상대가 비공개 계정일 때
                body = `${follower_name}님이 팔로우 요청을 보냈습니다.`;
            }
        } else if (notification.type = 'general') {
            let following_name = await accountModel.getUserNameById(noticeData.following_id)
            target_id = toString(noticeData.following_id);
            body = `${following_name}님이 팔로우 요청을 수락했습니다.`
        }
        let message = {
            notification: {
                title: title,
                body: body
            },
            data: {
                target_id: target_id
            },
            token: token,
        }

        admin
            .messaging()
            .send(message)
            .then(function (response) {
                console.log('Successfully sent message: : ', response)
            })
            .catch(function (err) {
                console.log('Error Sending message : ', err)
            })
    },
    // TODO : 여러 사용자에게 FCM 푸시 알림 전송
    sendMultiPush: async(noticeData) => {
        let {user_id_list, title, body} = noticeData 
        const tokens = await noticeModel.getAllFCMTokens(user_id_list);

        if (tokens.length == 0) {
            console.log('FCM토큰이 0개일 경우 알림 발송 안함')
            return
        } else {
            const tokenChuncks = [];
            for (let i=0; i<tokens.length; i +=499) {
                tokenChuncks.push(tokens.slice(i, i+499))
            }
        }
        
        // 각 chunk를 순회하면서 메시지 전송
        for (let chunk of tokenChuncks) {
            let message = {
                notification: {
                    title: '전체 알림 title',
                    body: '전체 알림 body'
                },
                tokens: chunk, // 여러 토큰 지정
            };
            // 메시지 전송
            admin
                .messaging()
                .sendEach(message)
                .then(function (response) {
                    console.log('Successfully sent message(all): : ', response)
                })
                .catch(function (err) {
                    console.log('Error Sending message!!! : ', err)
                })
        }
    },
    // TODO : 타입에 따라 슬랙 메세지 전송
    sendSlack: async (noticeData) => {
        try {
            let message = "";
            if (noticeData.type === 'customer.suggestion') {
                const user_name = await accountModel.getUserNameById(noticeData.user_id);
                const content = noticeData.content;
                const email = noticeData.email;
                message = `
                -----# 고객의견 알림 #-----\n*${user_name}*님이 고객센터에 새로운 의견을 남겼습니다.\n\n${content}\n\nuser_id: ${noticeData.user_id}\nemail: ${email}
                `;

                await slackClient.chat.postMessage({
                    channel: '#고객의견',
                    text: message
                })
                return
            } 
            if (noticeData.type === 'error') {
                const errorData = noticeData;
                console.log("sendSlack errorData: ", errorData)
                message = `
                ===:rotating_light:서버 에러 발생:rotating_light:===\n\n===STACK TRACE===\n${errorData.stack}
                `;
                await slackClient.chat.postMessage({
                    channel: '#error',
                    text: message
                });
                return
            }
        } catch (err) {
            console.log('sendSlack ERROR : ', err);
            next(err)
        } 
    }
};