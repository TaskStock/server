module.exports = {
    createSistatistics: async(db, stockitem_id)=>{
        const query = 'insert into "SIStatistics" (stockitem_id) VALUES ($1)';
        const values = [stockitem_id];

        await db.query(query, values)
            .then(res => {
                // console.log(res.rows[0]);
            })
            .catch(e => {
                e.name = "createSistatisticsError";
                throw e;
            });
    },
    updateSistatistics: async(db, stockitem_id, total_count, total_success_count, dayOfWeek)=>{
        // 1 : 월요일, 2 : 화요일, 3 : 수요일, 4 : 목요일, 5 : 금요일, 6 : 토요일, 7 : 일요일
        let query;
        if(dayOfWeek === 1){
            query = 'update "SIStatistics" set total_count=total_count+$1, total_success_count=total_success_count+$2, monday=monday+$1, s_monday=s_monday+$2 where stockitem_id=$3';
        }else if(dayOfWeek === 2){
            query = 'update "SIStatistics" set total_count=total_count+$1, total_success_count=total_success_count+$2, tuesday=tuesday+$1, s_tuesday=s_tuesday+$2 where stockitem_id=$3';
        }else if(dayOfWeek === 3){
            query = 'update "SIStatistics" set total_count=total_count+$1, total_success_count=total_success_count+$2, wednesday=wednesday+$1, s_wednesday=s_wednesday+$2 where stockitem_id=$3';
        }else if(dayOfWeek === 4){
            query = 'update "SIStatistics" set total_count=total_count+$1, total_success_count=total_success_count+$2, thursday=thursday+$1, s_thursday=s_thursday+$2 where stockitem_id=$3';
        }else if(dayOfWeek === 5){
            query = 'update "SIStatistics" set total_count=total_count+$1, total_success_count=total_success_count+$2, friday=friday+$1, s_friday=s_friday+$2 where stockitem_id=$3';
        }else if(dayOfWeek === 6){
            query = 'update "SIStatistics" set total_count=total_count+$1, total_success_count=total_success_count+$2, saturday=saturday+$1, s_saturday=s_saturday+$2 where stockitem_id=$3';
        }else if(dayOfWeek === 7){
            query = 'update "SIStatistics" set total_count=total_count+$1, total_success_count=total_success_count+$2, sunday=sunday+$1, s_sunday=s_sunday+$2 where stockitem_id=$3';
        }
        const values = [total_count, total_success_count, stockitem_id];

        await db.query(query, values)
            .then(res => {
                // console.log(res.rows[0]);
            })
            .catch(e => {
                e.name = "updateSistatisticsError";
                throw e;
            });
    },
    getSistatistics: async(db, stockitem_id)=>{
        const query = 'select total_count, total_success_count, monday, tuesday, wednesday, thursday, friday, saturday, sunday, s_monday, s_tuesday, s_wednesday, s_thursday, s_friday, s_saturday, s_sunday from "SIStatistics" where stockitem_id=$1';
        const values = [stockitem_id];

        const statistics = await db.query(query, values)
            .then(res => {
                // console.log(res.rows[0]);
                return res.rows[0];
            })
            .catch(e => {
                e.name = "getSistatisticsError";
                throw e;
            });
        return statistics;
    },
}