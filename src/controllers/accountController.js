const accountModel = require('../models/accountModel.js');
const mailer = require('../../nodemailer/mailer.js');

module.exports = {
    //이메일 인증
    sendMail: async (req, res) => {
        try {
            const emailData = req.body;
            const availible = await accountModel.availible(emailData);

            if (!availible) {
                res.json({ result: "fail" , message: "이미 가입된 이메일입니다."});
            } else {
                let authCode = '';
                for (let i = 0; i < 6; i++) {
                    authCode += Math.floor(Math.random() * 10);
                } //여섯자리 숫자로 이루어진 인증코드 생성(string)
                const mailResult = await mailer(emailData.email, authCode);
                if (mailResult) {
                    res.json({ result: "success", authCode: authCode });
                }
            } 
        } catch (error) {
            console.log(error);
            res.json({ result: "fail" });
        }
    }
}