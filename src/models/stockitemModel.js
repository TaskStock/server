module.exports = {
    insertStockitem: async(db, name, level, region)=>{
        const query = 'insert into "Stockitem" (name, level, region) VALUES ($1, $2, $3) returning stockitem_id';
        const values = [name, level, region];

        const stockitem_id = await db.query(query, values)
            .then(res => {
                // console.log(res.rows[0]);
                return res.rows[0].stockitem_id;
            })
            .catch(e => {
                console.error(e.stack);

                throw e;
            });
        return stockitem_id;
    },
    updateStockitem: async(db, stockitem_id, name, level)=>{
        const query = 'update "Stockitem" set name=$1, level=$2 where stockitem_id=$3';
        const values = [name, level, stockitem_id];

        await db.query(query, values)
            .then(res => {
                // console.log(res.rows[0]);
            })
            .catch(e => {
                console.error(e.stack);

                throw e;
            });
    },
    deleteStockitem: async(db, stockitem_id)=>{
        const query = 'delete from "Stockitem" where stockitem_id=$1';
        const values = [stockitem_id];

        await db.query(query, values)
            .then(res => {
                // console.log(res.rows[0]);
            })
            .catch(e => {
                console.error(e.stack);

                throw e;
            });
    },
    getStockitems: async(db)=>{
        const query = 'select * from "Stockitem"';
        const values = [];

        const stockitems = await db.query(query, values)
            .then(res => {
                // console.log(res.rows);
                return res.rows;
            })
            .catch(e => {
                console.error(e.stack);

                throw e;
            });
        return stockitems;
    },
    getStockitemsWithRegion: async(db, region)=>{
        const query = 'select stockitem_id from "Stockitem" where region = $1';
        const values = [region];

        const stockitems = await db.query(query, values)
            .then(res => {
                // console.log(res.rows);
                return res.rows;
            })
            .catch(e => {
                console.error(e.stack);

                throw e;
            });
        return stockitems;
    },
    updateStockitemInScheduler: async(db, stockitem_id)=>{
        // y_take_count, y_success_count 에 오늘 값을 먼저 넣은 후 오늘 값들은 0으로 설정
        const query = 'update "Stockitem" set y_take_count=take_count, y_success_count=success_count, take_count=0, success_count=0 where stockitem_id=$1 returning y_take_count, y_success_count';
        const values = [stockitem_id];

        const stockitem = await db.query(query, values)
            .then(res => {
                // console.log(res.rows[0]);
                return res.rows[0];
            })
            .catch(e => {
                console.error(e.stack);

                throw e;
            });
        return stockitem;
    },
    increaseTakecount: async(db, stockitem_id)=>{
        const query = 'update "Stockitem" set take_count=take_count+1 where stockitem_id=$1 returning take_count, success_count';
        const values = [stockitem_id];

        const stockitem = await db.query(query, values)
            .then(res => {
                // console.log(res.rows[0]);
                return res.rows[0];
            })
            .catch(e => {
                console.error(e.stack);

                throw e;
            });
        return stockitem;
    },
    increaseSuccesscount: async(db, stockitem_id)=>{
        const query = 'update "Stockitem" set success_count=success_count+1 where stockitem_id=$1 returning take_count, success_count';
        const values = [stockitem_id];

        const stockitem = await db.query(query, values)
            .then(res => {
                // console.log(res.rows[0]);
                return res.rows[0];
            })
            .catch(e => {
                console.error(e.stack);

                throw e;
            });
        return stockitem;
    },
    decreaseSuccesscount: async(db, stockitem_id)=>{
        const query = 'update "Stockitem" set success_count=success_count-1 where stockitem_id=$1 returning take_count, success_count';
        const values = [stockitem_id];

        const stockitem = await db.query(query, values)
            .then(res => {
                // console.log(res.rows[0]);
                return res.rows[0];
            })
            .catch(e => {
                console.error(e.stack);

                throw e;
            });
        return stockitem;
    },
    decreaseTakecount: async(db, stockitem_id)=>{
        const query = 'update "Stockitem" set take_count=take_count-1 where stockitem_id=$1 returning take_count, success_count';
        const values = [stockitem_id];

        const stockitem = await db.query(query, values)
            .then(res => {
                // console.log(res.rows[0]);
                return res.rows[0];
            })
            .catch(e => {
                console.error(e.stack);

                throw e;
            });
        return stockitem;
    },
    decreaseTwocount: async(db, stockitem_id)=>{
        const query = 'update "Stockitem" set take_count=take_count-1, success_count=success_count-1 where stockitem_id=$1 returning take_count, success_count';
        const values = [stockitem_id];

        const stockitem = await db.query(query, values)
            .then(res => {
                // console.log(res.rows[0]);
                return res.rows[0];
            })
            .catch(e => {
                console.error(e.stack);

                throw e;
            });
        return stockitem;
    },
    // 나의 관심종목 가져오기
    getMyinterest: async(db, user_id)=>{
        const query = `
        select * 
        from "Stockitem" s 
            inner join "SIMap" m
            on s.stockitem_id = m.stockitem_id
        where m.user_id=$1 
        order by m.take_count desc
        limit 15
        `;
        const values = [user_id];

        const stockitems = await db.query(query, values)
            .then(res => {
                // console.log(res.rows[0]);
                return res.rows;
            })
            .catch(e => {
                console.error(e.stack);

                throw e;
            });
        return stockitems;
    },
    // 오늘의 인기종목
    getTodaypopular: async(db)=>{
        const query = 'select * from "Stockitem" order by take_count desc limit 5';
        const values = [];

        const stockitems = await db.query(query, values)
            .then(res => {
                // console.log(res.rows);
                return res.rows;
            })
            .catch(e => {
                console.error(e.stack);

                throw e;
            });
        return stockitems;
    },
    // 오늘의 추천종목
    getTodayrecommend: async(db)=>{
        const query = 'select * from "Stockitem" order by take_count limit 10';
        const values = [];

        const stockitems = await db.query(query, values)
            .then(res => {
                // console.log(res.rows);
                return res.rows;
            })
            .catch(e => {
                console.error(e.stack);

                throw e;
            });
        return stockitems;
    },
    // 전체 종목 리스트 조회
    getAll: async(db, date, user_id)=>{
        const query = `
        select s.*, v.success_rate, svm.user_id
        from "Stockitem" s
            inner join "SIValue" v
            on s.stockitem_id = v.stockitem_id
            left join
                (select sivalue_id, user_id from "SIValueMap" where user_id = $2) as svm
            on v.sivalue_id = svm.sivalue_id
        where v.date=$1
        `;
        const values = [date, user_id];

        const stockitems = await db.query(query, values)
            .then(res => {
                console.log(res.rows);
                return res.rows;
            })
            .catch(e => {
                console.error(e.stack);

                throw e;
            });
        return stockitems;
    },
    // 종목 디테일 조회
    getItemDetail: async(db, stockitem_id, user_id)=>{
        const query = `
        select s.name, s.level, s.take_count, s.success_count, st.total_count, st.total_success_count, st.monday, st.tuesday, st.wednesday, st.thursday, st.friday, st.saturday, st.sunday, m.take_count my_take_count, m.success_count my_success_count 
        from "Stockitem" s
            inner join "SIStatistics" st
            on s.stockitem_id = st.stockitem_id 
            left join "SIMap" m
            on s.stockitem_id = m.stockitem_id
        where s.stockitem_id=$1 and m.user_id = $2
        `;
        const values = [stockitem_id, user_id];

        const stockitem = await db.query(query, values)
            .then(res => {
                // console.log(res.rows);
                return res.rows[0];
            })
            .catch(e => {
                console.error(e.stack);

                throw e;
            });
        return stockitem;
    },
}