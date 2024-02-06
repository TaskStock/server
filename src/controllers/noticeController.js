const noticeModel = require('../models/noticeModel');
const noticeService = require('../service/noticeService');
const db = require('../config/db.js');

module.exports = {
    getAllNotice: async (req, res, next) => {
        try {
            const user_id = req.user.user_id;
            console.log('user_id : ', user_id);
            const noticeList = await noticeModel.getAllNotice(db, user_id);
            return res.status(200).json({
                noticeList: noticeList
        });
        } catch (err) {
            // console.log('getAllNotice ERROR : ', err);
            err.name = 'getAllNotice ERROR'; // err에 name객체 있음
            next(err);

        }
    },
    //운영진 공지사항 읽어올 때만 사용
    getNoticeById: async (req, res, next) => {
        try {
            const notice_id = req.params.notice_id;
            const noticeData = await noticeModel.getNoticeById(db, notice_id);
            return res.status(200).json({
                noticeData: noticeData
            });
        } catch (err) {
            next(err);

        }
    }, 
    changeNoticeSetting: async (req, res, next) => {
        try {
            const user_id = req.user.user_id;
            const isPushOn = req.body.isPushOn;
            await noticeModel.changeNoticeSetting(db, user_id, isPushOn);
            return res.status(200).json({
                result: "success",
            });
        } catch (err) {
            next(err);

        }
    },
    saveFCMToken: async(req, res, next) => {
        try {
            const FCMToken = req.body.FCMToken;
            const isPushOn = req.body.isPushOn;
            const user_id = req.user.user_id;

            await noticeModel.saveFCMToken(db, user_id, isPushOn, FCMToken);
            return res.status(200).json({
                result: "success",
            }); 
    } catch (err) {
            next(err);

        }
    },
    updateFCMToken: async(req, res, next) => {
        try {
            const user_id = req.user.user_id
            const FCMToken = req.body.FCMToken;

            await noticeModel.updateFCMToken(db, user_id, FCMToken);
            return res.json.status({
                result: "success",
            });
        } catch (err) {
            next(err);

        }
    },
    sendCustomerSuggestion: async(req, res, next) => {
        try {
            const user_id = req.user.user_id;
            const content = req.body.content
            const email = req.body.email;

            await noticeModel.saveCustomerSuggestion(db, user_id, content, email);

            const noticeData = {
                type: 'customer.suggestion',
                user_id: user_id,
                content: content,
                email: email
            }
            await noticeService.sendSlack(noticeData);
            return res.status(200).json({
                result: "success"
            });

        } catch (err) {
            next(err);

        }
    } 
};