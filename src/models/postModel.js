const db = require('../config/db.js');

module.exports = {
    // board_type_id 로 서로 다른 게시글 데이터를 가져옴
    getAll: async()=>{
        testpost = [
            {id:"1", title:"test1", content:"content1"},
            {id:"2", title:"test2", content:"content2"}];

        return testpost;
    },

}