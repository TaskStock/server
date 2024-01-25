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
        
        try{
            await retrospectModel.insertRetrospect(project_id, content, user_id);
        }catch(error){
            next(error);
        }
    
        res.json({result: "success"});
    },
    updateRetrospect: async(req, res, next) =>{
        const {retrospect_id, content} = req.body;
        const user_id = req.user.user_id;
        
        try{
            await retrospectModel.updateRetrospect(retrospect_id, user_id, content);
        }catch(error){
            next(error);
        }
    
        res.json({result: "success"});
    },
    deleteRetrospect: async(req, res, next) =>{
        const {retrospect_id} = req.body;
        const user_id = req.user.user_id;
        
        try{
            await retrospectModel.deleteRestrospect(retrospect_id, user_id);
        }catch(error){
            next(error);
        }
    
        res.json({result: "success"});
    },
    getRetrospectsWithMonth: async(req, res, next) =>{
        const date = req.query.date;

        const user_id = req.user.user_id;
        const region = req.user.region;
        
        try{
            const start_date = transdate.getStartOfMonthTime(date, region);
            const end_date = transdate.getNextMonthTime(date, region);

            const retrospects = await retrospectModel.getRetrospectsWithMonth(user_id, start_date, end_date);

            return res.json({retrospects: retrospects});
        }catch(error){
            next(error);
        }
    
        res.json({result: "success"});
    },
    getRetrospectsAll: async(req, res, next) =>{
        const offset = req.query.offset;
        const limit = req.query.limit;
        let filter = req.query.filter;
        let search = req.query.search;

        const user_id = req.user.user_id;
        
        try{
            filter = filtering(filter);
            search = searching(search);
            const retrospects = await retrospectModel.getRetrospectsAll(user_id, offset, limit, filter, search);

            return res.json({retrospects: retrospects});
        }catch(error){
            next(error);
        }
    
        res.json({result: "success"});
    },
    getRetrospectsWithProject: async(req, res, next) =>{
        const project_id = req.params.project_id;
        const offset = req.query.offset;
        const limit = req.query.limit;
        let filter = req.query.filter;
        let search = req.query.search;

        const user_id = req.user.user_id;
        
        try{
            // 필터는 정해진 규격에 맞게 변환해주고 검색은 그대로 모델로 전달
            filter = filtering(filter);
            search = searching(search);

            const retrospects = await retrospectModel.getRetrospectsWithProject(user_id, project_id, offset, limit, filter, search);

            return res.json({retrospects: retrospects});
        }catch(error){
            next(error);
        }
    
        res.json({result: "success"});
    }
}