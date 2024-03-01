const projectModel = require('../models/projectModel.js');
const todoModel = require('../models/todoModel.js');

const transdate = require('../service/transdateService.js');

const db = require('../config/db.js');

module.exports = {
    newProject: async(req, res, next) =>{
        const {name, emoji, public_range} = req.body;
        const user_id = req.user.user_id;
        // public_range
        // none : 비공개
        // follow : 팔로워공개
        // all : 전체공개
        
        try{
            await projectModel.insertProject(db, user_id, name, emoji, public_range);

			return res.json({result: "success"});
        }catch(error){
            next(error);
        }
    },
    updateProject: async(req, res, next) =>{
        const {project_id, name, emoji, public_range, finished} = req.body;
        const user_id = req.user.user_id;
        
        try{
            await projectModel.updateProject(db, project_id, user_id, name, emoji, public_range, finished);

			return res.json({result: "success"});
        }catch(error){
            next(error);
        }
    },
    // 프로젝트와 해당 프로젝트의 todo들 반환
    readProjectWithTodos: async(req, res, next) =>{
        const project_id = req.params.project_id;
        const user_id = req.user.user_id;

        const cn = await db.connect();
        try{
            await cn.query('BEGIN');

            const project = await projectModel.readProject(cn, project_id, user_id);
            const todos = await todoModel.readTodosUsingProject(cn, project_id, user_id);

            await cn.query('COMMIT');
            return res.json({project: project, todos: todos});
        }catch(error){
            await cn.query('ROLLBACK');
            next(error);
        }finally{
            cn.release();
        }
    },
    readAllProjects: async(req, res, next) =>{
        const user_id = req.user.user_id;
        
        try{
            const projects = await projectModel.readAllProjects(db, user_id);

            return res.json({projects: projects});
        }catch(error){
            next(error);
        }
    },
    deleteProject: async(req, res, next) =>{
        const {project_id} = req.body;
        const user_id = req.user.user_id;
        const region = req.user.region;
        
        const cn = await db.connect();
        try{
            await cn.query('BEGIN');

            const sttime = transdate.getSettlementTimeInUTC(region);
            // user_id, project_id, date

            await todoModel.deleteTodoBecauseDeleteProject(db, user_id, project_id, sttime);
            await projectModel.deleteProject(db, project_id, user_id);

            await cn.query('COMMIT');
			return res.json({result: "success"});
        }catch(error){
            await cn.query('ROLLBACK');
            next(error);
        }finally{
            cn.release();
        }
    },
}