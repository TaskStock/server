const db = require('../config/db.js');

module.exports = {
    getAll: async()=>{
        // db 테스트 코드
        db.connect();
        
        //insert
        const text = "insert into test (email) values($1);"
        const values = ['123456@gmail.com'];

        db.query(text, values)
            .then(res => console.log(res.rows[0]))
            .catch(e => console.error(e.stack));

        //select
        const testPost = db.query("SELECT * FROM test")
        return testPost

    },
}