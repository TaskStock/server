const noticeModel = require('../models/noticeModel');

module.exports = {
    getAllNotice: async (req, res) => {
        try {
            const user_id = req.user.user_id;
            const noticeData = await noticeModel.getAllNotice(user_id);
            return res.status(200).json({
                noticeData
        });
        } catch (err) {
            console.log('getAllNotice ERROR : ', err);
            return res.status(500).json({
                message: "서버 내부 오류"
            });
        }
    },
    
};