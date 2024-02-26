const noticeModel = require('../models/noticeModel.js');
const accountModel = require('../models/accountModel.js');
const admin = require('../config/FCMconfig.js');
const slackClient = require('../config/slackConfig.js');
const db = require('../config/db.js');
const jwt = require('jsonwebtoken');

module.exports = {
    // TODO : 알림 DB에 추가. user_id, content, notice_type => noticeData에 넣어서 전달
    processNotice: async (db, predata) => {
        try {
            let noticeData = {
                user_id: predata.user_id, // 알림을 받을 사람 ID
                content: '', // 알림 내용
                type: predata.type, // 알림 타입
                info: '' // 알림 터치 등 동작 구현을 위한 추가 정보
            };
            let displayAccept;
            
            if (noticeData.type === 'sns') {
                let follower_name = await accountModel.getUserNameById(db, predata.follower_id);
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

            } else if (noticeData.type === 'general') {
                let following_name = await accountModel.getUserNameById(db, predata.following_id);
                noticeData.content = `${following_name}님이 팔로우 요청을 수락했습니다.`;

                noticeData.info = JSON.stringify({
                    target_id: predata.following_id
                });
            
            } else if (noticeData.type === 'badge') {
                noticeData.content = '새로운 뱃지를 획득했습니다. 🔥';
                noticeData.info = null;
            }

            await noticeModel.createNotice(db, noticeData);
        } catch (err) {
            err.name = 'Notice - ProcessNoticeError'
            throw err
        }
    },
    // TODO : FCM 푸시 알림 전송
    sendPush: async (db, noticeData) => {
        const user_id = noticeData.user_id; // 알림 받을 상대의 user_id
        
        const token = await noticeModel.getFCMToken(db, user_id); // 푸시메세지를 받을 유저의 FCM 토큰

        if (token.length == 0) {
            // console.log('FCM토큰이 0개일 경우 알림 발송 안함')
            return
        }
        let title = 'TASKSTOCK';
        let body = '';
        let target_id;
        if (noticeData.type === 'sns') {
            let follower_name = await accountModel.getUserNameById(db, noticeData.follower_id)
            target_id = noticeData.follower_id.toString()
            if (noticeData.followerPending === false) { // 팔로우 당한 사람이 공개 계정
                body = `${follower_name}님이 팔로우를 시작했습니다.`;
            } else { // 상대가 비공개 계정일 때
                body = `${follower_name}님이 팔로우 요청을 보냈습니다.`;
            }
        } else if (noticeData.type = 'general') {
            let following_name = await accountModel.getUserNameById(db, noticeData.following_id)
            target_id = noticeData.following_id.toString()
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
            android: {
                priority: 'high'
            },
            apns: {
                payload: {
                    aps: {
                        contentAvailable: true
                    }
                }
            }
        }

        admin
            .messaging()
            .send(message)
            .then(function (response) {
                // console.log('Successfully sent message: : ', response)
            })
            .catch(function (err) {
                err.name = 'FCM - SendPushError'
                throw err
                // console.log('Error Sending message : ', err)
            })
    },
    // TODO : 여러 사용자에게 같은 내용의 FCM 푸시 알림 전송
    // ! @params: noticeData = {user_id_list: [user_id, user_id, ...]}
    sendMultiPush: async(noticeData) => {
        let {user_id_list} = noticeData //user_id_list: 알림을 보낼 사용자 목록 user_id 리스트
        const tokens = await noticeModel.getAllFCMTokens(db, user_id_list);

        if (tokens.length == 0) {
            // console.log('FCM토큰이 0개일 경우 알림 발송 안함')
            return
        } else {
            const tokenChuncks = [];
            for (let i=0; i<tokens.length; i +=499) { //최대 500개 까지 전송 가능해서 499개씩 끊어서 보냄
                tokenChuncks.push(tokens.slice(i, i+499))
            }
        }
        let title = 'TASKSTOCK';
        let body = '장 마감 한 시간 전입니다! 오늘의 가치를 확인해주세요'
        
        // 각 chunk를 순회하면서 메시지 전송
        for (let chunk of tokenChuncks) {
            let message = {
                notification: {
                    title: title,
                    body: body
                },
                tokens: chunk, // 여러 토큰 지정
            };
            // 메시지 전송
            admin
                .messaging()
                .sendEach(message)
                .then(function (response) {
                    // console.log('Successfully sent message(all): : ', response)
                })
                .catch(function (err) {
                    err.name = 'FCM - SendMultiPushError'
                    throw err
                })
        }
    },
    sendMultiPushBeforeMidnight: async(region) => {
        const tokens = await noticeModel.getAllFCMTokensInRegion(db, region);

        let tokenChuncks = [];
        
        if (tokens.length == 0) {
            // console.log('FCM토큰이 0개일 경우 알림 발송 안함')
            return
        } else {
            for (let i=0; i<tokens.length; i +=499) { //최대 500개 까지 전송 가능해서 499개씩 끊어서 보냄
                tokenChuncks.push(tokens.slice(i, i+499))
            }
        }
        let title = 'TASKSTOCK';
        let body = '장 마감 한 시간 전입니다! 오늘의 가치 변화를 확인해주세요. \uD83D\uDCC8'
        
        // 각 chunk를 순회하면서 메시지 전송
        for (let chunk of tokenChuncks) {
            let messages = chunk.map(token => ({
            notification: {
                title: title,
                body: body
            },
            token: token, // 여기서는 개별 토큰 지정
            android: {
                priority: 'high'
            },
            apns: {
                payload: {
                    aps: {
                        contentAvailable: true
                    }
                }
            }
            }));
            // 메시지 전송 전 확인
            if (messages.length === 0) {
                // console.log("No messages to send");
                return;
            }
            // 메시지 전송
            admin
                .messaging()
                .sendAll(messages)
                .then(function (response) {
                    // console.log('Successfully sent message(all): : ', response)
                })
                .catch(function (err) {
                    err.name = 'FCM - SendMultiPushBeforeMidnightError'
                    throw err
                })
        }
    },
    sendMultiPushInMorning: async(region) => {
        const tokens = await noticeModel.getAllFCMTokensInRegion(db, region);

        let tokenChuncks = [];
        
        if (tokens.length == 0) {
            // console.log('FCM토큰이 0개일 경우 알림 발송 안함')
            return
        } else {
            for (let i=0; i<tokens.length; i +=499) { //최대 500개 까지 전송 가능해서 499개씩 끊어서 보냄
                tokenChuncks.push(tokens.slice(i, i+499))
            }
        }
        let title = 'TASKSTOCK';
        let body = '오늘의 가치를 올리는 첫 걸음, 계획을 세워볼까요? \uD83C\uDF1E'
        
        // 각 chunk를 순회하면서 메시지 전송
        for (let chunk of tokenChuncks) {
            let messages = chunk.map(token => ({
            notification: {
                title: title,
                body: body
            },
            token: token, // 여기서는 개별 토큰 지정
            android: {
                priority: 'high'
            },
            apns: {
                payload: {
                    aps: {
                        contentAvailable: true
                    }
                }
            }
            }));
            // 메시지 전송 전 확인
            if (messages.length === 0) {
                // console.log("No messages to send");
                return;
            }
            // 메시지 전송
            admin
                .messaging()
                .sendAll(messages)
                .then(function (response) {
                    // console.log('Successfully sent message(all): : ', response)
                })
                .catch(function (err) {
                    err.name = 'FCM - SendMultiPushInMorningError'
                    throw err
                })
        }
    },
    // TODO : 타입에 따라 슬랙 메세지 전송
    sendSlack: async (noticeData) => {
        try {
            let message = "";
            if (noticeData.type === 'customer.suggestion') {
                const user_name = await accountModel.getUserNameById(db, noticeData.user_id);
                const content = noticeData.content;
                const email = noticeData.email;
                message = `
                -----# 고객의견 알림 #-----\n*${user_name}*님이 고객센터에 새로운 의견을 남겼습니다.\n\n-----# 의견 #-----\n${content}\n\nuser_id: ${noticeData.user_id}\nemail: ${email}
                `;

                await slackClient.chat.postMessage({
                    channel: '#고객의견',
                    text: message
                })
                return
            } 
            if (noticeData.type === 'error') {
                const errorData = noticeData;
                let accessToken;
                let message;

                if (errorData.ReqHeaders.authorization === undefined || errorData.ReqHeaders.authorization === null) {
                    message = `
                    ===:rotating_light:서버 에러 발생:rotating_light:===\n\n==USER INFO==\naccess token이 안 넘어옴. 유저 정보 알 수 없음\n\n===STACK TRACE===\n${errorData.stack}\n\n===ERROR INFO===\n${errorData.message}\n\n===REQUEST BODY===\n${JSON.stringify(errorData.ReqBody)}
                    `;

                } else {
                    accessToken = jwt.decode(errorData.ReqHeaders.authorization.split(' ')[1]);
                    const user_id = accessToken.user_id;
                    const user_name = await accountModel.getUserNameById(db, user_id);

                    message = `
                    ===:rotating_light:서버 에러 발생:rotating_light:===\n\n==USER INFO==\nuser_name: ${user_name}\nuser_id: ${user_id}\n\n===STACK TRACE===\n${errorData.stack}\n\n===ERROR INFO===\n${errorData.message}\n\n===REQUEST BODY===\n${JSON.stringify(errorData.ReqBody)}
                    `;
                }
                
                
                await slackClient.chat.postMessage({
                    channel: '#error',
                    text: message
                });
                return
            }
        } catch (err) {
            err.name = 'Slack - SendSlackError'
            throw err
        } 
    }
};