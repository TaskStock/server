const retrospectModel = require('../models/retrospectModel.js');

const transdate = require('../service/transdateService.js');

function filtering(filter){
    if(filter === undefined){   // default : 최신순
        filter = "created_date desc";
    }else if(filter === "earliest"){    // 오래된순
        filter = "created_date";
    }else if(filter === "latest"){  // 최신순
        filter = "created_date desc";
    }else{
        filter = "created_date desc";
    }
    return filter;
}
function searching(search){
    if(search !== undefined){
        search = "%"+search+"%";
    }
    return search;
}

module.exports = {
    newRetrospect: async(req, res, next) =>{
        const {project_id, content} = req.body;
        const user_id = req.user.user_id;
        
        const db = req.dbClient;
        try{
            await retrospectModel.insertRetrospect(db, project_id, content, user_id);

            await db.query('COMMIT');
			return res.json({result: "success"});
        }catch(error){
            await db.query('ROLLBACK');
            next(error);
        }finally{
            db.release();
        }
    },
    updateRetrospect: async(req, res, next) =>{
        const {retrospect_id, project_id, content} = req.body;
        const user_id = req.user.user_id;
        
        const db = req.dbClient;
        try{
            await retrospectModel.updateRetrospect(db, retrospect_id, project_id, user_id, content);

            await db.query('COMMIT');
			return res.json({result: "success"});
        }catch(error){
            await db.query('ROLLBACK');
            next(error);
        }finally{
            db.release();
        }
    },
    deleteRetrospect: async(req, res, next) =>{
        const {retrospect_id} = req.body;
        const user_id = req.user.user_id;
        
        const db = req.dbClient;
        try{
            await retrospectModel.deleteRestrospect(db, retrospect_id, user_id);

            await db.query('COMMIT');
			return res.json({result: "success"});
        }catch(error){
            await db.query('ROLLBACK');
            next(error);
        }finally{
            db.release();
        }
    },
    getRetrospectsWithMonth: async(req, res, next) =>{
        const date = req.query.date;

        const user_id = req.user.user_id;
        const region = req.user.region;
        
        const db = req.dbClient;
        try{
            const start_date = transdate.getStartOfMonthTime(date, region);
            const end_date = transdate.getNextMonthTime(date, region);

            const retrospects = await retrospectModel.getRetrospectsWithMonth(db, user_id, start_date, end_date);

            await db.query('COMMIT');
            return res.json({retrospects: retrospects});
        }catch(error){
            await db.query('ROLLBACK');
            next(error);
        }finally{
            db.release();
        }
    },
    getRetrospectsAll: async(req, res, next) =>{
        const offset = req.query.offset;
        const limit = req.query.limit;
        let filter = req.query.filter;
        let search = req.query.search;

        const user_id = req.user.user_id;
        
        const db = req.dbClient;
        try{
            filter = filtering(filter);
            search = searching(search);
            const retrospects = await retrospectModel.getRetrospectsAll(db, user_id, offset, limit, filter, search);

            await db.query('COMMIT');
            return res.json({retrospects: retrospects});
        }catch(error){
            await db.query('ROLLBACK');
            next(error);
        }finally{
            db.release();
        }
    },
    getRetrospectsWithProject: async(req, res, next) =>{
        const project_id = req.params.project_id;
        const offset = req.query.offset;
        const limit = req.query.limit;
        let filter = req.query.filter;
        let search = req.query.search;

        const user_id = req.user.user_id;
        
        const db = req.dbClient;
        try{
            // 필터는 정해진 규격에 맞게 변환해주고 검색은 그대로 모델로 전달
            filter = filtering(filter);
            search = searching(search);

            const retrospects = await retrospectModel.getRetrospectsWithProject(db, user_id, project_id, offset, limit, filter, search);

            await db.query('COMMIT');
            return res.json({retrospects: retrospects});
        }catch(error){
            await db.query('ROLLBACK');
            next(error);
        }finally{
            db.release();
        }
    }
}