const db = require('../config/db.js');

module.exports = {
    // board_type_id 로 서로 다른 게시글 데이터를 가져옴
    getAll: async()=>{
        testpost = [
            {id:"1", title:"test1", content:"content1"},
            {id:"2", title:"test2", content:"content2"}];

        // db 테스트 코드
        db.connect();
        // db.query("SELECT NOW()", (err, res) => {
        //     console.log(err, res);
        //     db.end();
        // });

        // insert
        let query = {
            text: "INSERT INTO \"User\" (id, password, name, nickname) VALUES ($1, $2, $3, $4)",
            values: ["id1", "pwd1", "name1", "nickname1"],
        };
        db
            .query(query)
            .then((res) => {
                console.log(res);
            })
            .catch((e) => console.error(e.stack));

        // select
        query = {
            text: "SELECT * FROM \"User\"",
        };
        db
            .query(query)
            .then((res) => {
                console.log(res.rows[0]);
                db.end();
            })
            .catch((e) => console.error(e.stack));

        return testpost;
    },

}