const db = require('../config/db.js');

module.exports = {
    insertUser: async(u_data)=>{
        const id = u_data.id;
        const password = u_data.password;
        const name = u_data.name;
        const nickname = u_data.nickname;

        const query = "insert into \"User\" (id, password, name, nickname) VALUES ($1, $2, $3, $4) RETURNING user_id";  // returning으로 user_id를 반환하도록 설정
        const values = [id, password, name, nickname];

        let userId;

        await db.query(query, values)
            .then(res => {
                console.log(res.rows[0]);
                userId = res.rows[0].user_id;
            })
            .catch(e => {
                console.error(e.stack);

                // 오류 처리 예시 코드
                if (e instanceof SomeSpecificError) {
                    e.status = 404; // 예시로 404 Not Found 설정
                    e.message = '특정 리소스를 찾을 수 없습니다.';
                } else {
                    e.status = 500; // 일반적인 서버 오류
                    e.message = '서버에서 오류가 발생했습니다.';
                }

                // 다른 곳에서 처리하기 위해 오류 전파
                throw e;
            });
        
        return userId;
    },
    createSetting: async(u_id)=>{
        // screen 필드의 default값이 정해지지 않아서 임시로 넣었음. 나중에 빼야함
        const query = "insert into \"UserSetting\" (user_id, screen) VALUES ($1, $2)";
        const values = [u_id, "임시 데이터"];

        await db.query(query, values)
            .then(res => {
                console.log(res.rows[0]);
                // 반환 설정한게 없으므로 undefined가 뜸
            })
            .catch(e => {
                console.error(e.stack);

                throw e;
            });
    },
}