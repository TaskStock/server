const postModel = require('../models/postModel.js');

module.exports = {
    getAll: async(req, res) =>{
        const posts = await postModel.getAll();
        
        res.json({posts: posts});
    },
}