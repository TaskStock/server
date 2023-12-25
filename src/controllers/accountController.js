const accountModel = require('../models/accountModel.js');
const mailer = require('../../nodemailer/mailer.js');

module.exports = {
    //이메일 인증
    sendMail: async (req, res) => {
        try {
            const emailData = req.body;
            const availible = await accountModel.checkAvailible(emailData);

            if (!availible) {
                res.status(200).json({ result: "fail" , message: "이미 가입된 이메일입니다."});
            } else {
                let authCode = '';
                for (let i = 0; i < 6; i++) {
                    authCode += Math.floor(Math.random() * 10);
                } //여섯자리 숫자로 이루어진 인증코드 생성(string)
                const mailResult = await mailer(emailData.email, authCode);
                if (mailResult) {
                    const codeId = await accountModel.saveCode(authCode);
                    
                    res.status(200).json({ result: "success", codeId: codeId});
                }
            } 
        } catch (error) {
            console.log(error);
            res.status(500).json({ result: "fail", message: "서버 오류"});
        }
    },
    checkCode: async (req, res) => {
        try {
            const inputData = req.body;
            const checkResult = await accountModel.checkCode(inputData);
            
            if (checkResult) {
                
                const wellDeleted = await accountModel.deleteCode(inputData);
                if (!wellDeleted) {
                    res.status(500).json({ result: "success", message: "인증은 성공, 코드 삭제에서 오류" });
                }
                res.status(200).json({ result: "success", message: "코드 DB에서 삭제" });
            } else {
                res.status(200).json({ result: "fail", message: "인증코드가 일치하지 않음" });
            }
        } catch (error) {
            console.log(error);
            res.status(500).json({ result: "fail", message: "서버 오류" });
        }
        
    
    }
}