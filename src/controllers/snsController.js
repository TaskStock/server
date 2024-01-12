const snsModel = require('../models/snsModel.js');
const accountModel = require('../models/accountModel.js');

module.exports = {
    changePrivate: async(req, res) => {
        user_id = req.user.user_id;
        const private = req.body.private;
        const changeResult = await snsModel.changePrivate(user_id, private);
        if (changeResult) {
            res.status(200).json({
                result: "success"
            });
        } else {
            res.status(400).json({
                result: "fail"
            });
        }
    },
    hello: (req, res) =>  {
        res.status(200).json({
            message: "hello"
        });
    }
}
;