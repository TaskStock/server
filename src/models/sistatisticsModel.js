module.exports = {
    createSistatistics: async(db, stockitem_id)=>{
        const query = 'insert into "SIStatistics" (stockitem_id) VALUES ($1)';
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
    updateSistatistics: async(db, stockitem_id, total_count, success_count, dayOfWeek)=>{
        // 0 : 일요일, 1 : 월요일, 2 : 화요일, 3 : 수요일, 4 : 목요일, 5 : 금요일, 6 : 토요일
        let query;
        if(dayOfWeek === 0){
            query = 'update "SIStatistics" set total_count=total_count+$1, success_count=success_count+$2, sunday=sunday+$1 where stockitem_id=$3';
        }else if(dayOfWeek === 1){
            query = 'update "SIStatistics" set total_count=total_count+$1, success_count=success_count+$2, monday=monday+$1 where stockitem_id=$3';
        }else if(dayOfWeek === 2){
            query = 'update "SIStatistics" set total_count=total_count+$1, success_count=success_count+$2, tuesday=tuesday+$1 where stockitem_id=$3';
        }else if(dayOfWeek === 3){
            query = 'update "SIStatistics" set total_count=total_count+$1, success_count=success_count+$2, wednesday=wednesday+$1 where stockitem_id=$3';
        }else if(dayOfWeek === 4){
            query = 'update "SIStatistics" set total_count=total_count+$1, success_count=success_count+$2, thursday=thursday+$1 where stockitem_id=$3';
        }else if(dayOfWeek === 5){
            query = 'update "SIStatistics" set total_count=total_count+$1, success_count=success_count+$2, friday=friday+$1 where stockitem_id=$3';
        }else if(dayOfWeek === 6){
            query = 'update "SIStatistics" set total_count=total_count+$1, success_count=success_count+$2, saturday=saturday+$1 where stockitem_id=$3';
        }
        const values = [total_count, success_count, stockitem_id];

        await db.query(query, values)
            .then(res => {
                // console.log(res.rows[0]);
            })
            .catch(e => {
                console.error(e.stack);

                throw e;
            });
    },
}