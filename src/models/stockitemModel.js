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
                e.name = "updateStockitemError";

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
                e.name = "deleteStockitemError";

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
                e.name = "getStockitemsError";

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
                e.name = "getStockitemsWithRegionError";

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
                e.name = "updateStockitemInSchedulerError";

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
                e.name = "increaseTakecountError";

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
                e.name = "increaseSuccesscountError";

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
                e.name = "decreaseSuccesscountError";

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
                e.name = "decreaseTakecountError";

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
                e.name = "decreaseTwocountError";

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
                e.name = "getMyinterestError";

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
                e.name = "getTodaypopularError";

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
                e.name = "getTodayrecommendError";

                throw e;
            });
        return stockitems;
    },
    // 전체 종목 리스트 조회
    getAll: async(db, date)=>{
        // console.log(date);
        const query = `
        select s.*, v.success_rate
        from "Stockitem" s
            inner join "SIValue" v
            on s.stockitem_id = v.stockitem_id
        where v.date=$1
        `;
        const values = [date];

        const stockitems = await db.query(query, values)
            .then(res => {
                console.log(res.rows);
                return res.rows;
            })
            .catch(e => {
                e.name = "getAllError";

                throw e;
            });
        return stockitems;
    },
    // 종목 디테일 조회
    getItemDetail: async(db, stockitem_id, user_id, date)=>{
        const query = `
        select 
            s.name, s.level, s.take_count, s.success_count, 
            coalesce(m.take_count, 0) my_take_count, coalesce(m.success_count, 0) my_success_count, 
            svm.user_id as is_add_today
        from "Stockitem" s
            left join 
                (select * from "SIMap" where user_id = $2) m
                on s.stockitem_id = m.stockitem_id
            inner join "SIValue" v 
                on s.stockitem_id = v.stockitem_id
            left join
                (select * from "SIValueMap" where user_id = $2) as svm
                on v.sivalue_id = svm.sivalue_id
        where s.stockitem_id=$1 and v.date=$3
        `;
        const values = [stockitem_id, user_id, date];

        const stockitem = await db.query(query, values)
            .then(res => {
                // console.log(res.rows);
                return res.rows[0];
            })
            .catch(e => {
                e.name = "getItemDetailError";

                throw e;
            });
        return stockitem;
    },
}