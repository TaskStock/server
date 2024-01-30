const noticeModel = require('../models/noticeModel');

module.exports = {
    getAllNotice: async (req, res) => {
        try {
            const user_id = req.user.user_id;
            console.log('user_id : ', user_id);
            const noticeList = await noticeModel.getAllNotice(user_id);
            return res.status(200).json({
                noticeList: noticeList
        });
        } catch (err) {
            console.log('getAllNotice ERROR : ', err);
            return res.status(500).json({
                message: "서버 내부 오류"
            });
        }
    },
    //운영진 공지사항 읽어올 때만 사용
    getNoticeById: async (req, res) => {
        try {
            const notice_id = req.params.notice_id;
            const noticeData = await noticeModel.getNoticeById(notice_id);
            return res.status(200).json({
                noticeData: noticeData
            });
        } catch (err) {
            console.log('getNoticeById ERROR : ', err);
            return res.status(500).json({
                message: "서버 내부 오류"
            });
        }
    }, changeNoticeSetting: async (req, res) => {
        try {
            const user_id = req.user.user_id;
            const isPushOn = req.body.isPushOn;
            await noticeModel.changeNoticeSetting(user_id, isPushOn);
            return res.status(200).json({
                result: "success",
                message: "알림 설정 변경 완료"
            });
        } catch (e) {
            console.log('changeNoticeSetting ERROR : ', e);
            return res.status(500).json({
                message: "서버 내부 오류"
            });
        }
    }
};