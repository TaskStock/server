const accountModel = require('../models/accountModel.js');

module.exports = {
    newMember: async(req, res, next) =>{
        const memberData = req.body;
        
        try{
            const userId = await accountModel.insertUser(memberData);
            await accountModel.createSetting(userId);
            // await accountModel.createInvest(userId); 조금 더 기획다듬기 필요할듯(한번에 몇명 투자할 수 있는지 등)
        }catch(error){
            next(error);
        }
        
        res.json({result: "success"});
    },
}