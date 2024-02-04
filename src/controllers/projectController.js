const projectModel = require('../models/projectModel.js');
const todoModel = require('../models/todoModel.js');

module.exports = {
    newProject: async(req, res, next) =>{
        const {name, public_range} = req.body;
        const user_id = req.user.user_id;
        // public_range
        // none : 비공개
        // follow : 팔로워공개
        // all : 전체공개
        
        const db = req.dbClient;
        try{
            await projectModel.insertProject(db, user_id, name, public_range);

            await db.query('COMMIT');
			return res.json({result: "success"});
        }catch(error){
            await db.query('ROLLBACK');
            next(error);
        }finally{
            db.release();
        }
    },
    updateProject: async(req, res, next) =>{
        const {project_id, name, public_range, finished} = req.body;
        const user_id = req.user.user_id;
        
        const db = req.dbClient;
        try{
            await projectModel.updateProject(db, project_id, user_id, name, public_range, finished);

            await db.query('COMMIT');
			return res.json({result: "success"});
        }catch(error){
            await db.query('ROLLBACK');
            next(error);
        }finally{
            db.release();
        }
    },
    // 프로젝트와 해당 프로젝트의 todo들 반환
    readProjectWithTodos: async(req, res, next) =>{
        const project_id = req.params.project_id;
        const user_id = req.user.user_id;

        const db = req.dbClient;
        try{
            const project = await projectModel.readProject(db, project_id, user_id);
            const todos = await todoModel.readTodosUsingProject(db, project_id, user_id);

            await db.query('COMMIT');
            return res.json({project: project, todos: todos});
        }catch(error){
            await db.query('ROLLBACK');
            next(error);
        }finally{
            db.release();
        }
    },
    readAllProjects: async(req, res, next) =>{
        const user_id = req.user.user_id;
        
        const db = req.dbClient;
        try{
            const projects = await projectModel.readAllProjects(db, user_id);

            await db.query('COMMIT');
            return res.json({projects: projects});
        }catch(error){
            await db.query('ROLLBACK');
            next(error);
        }finally{
            db.release();
        }
    },
    deleteProject: async(req, res, next) =>{
        const {project_id} = req.body;
        const user_id = req.user.user_id;
        
        const db = req.dbClient;
        try{
            await projectModel.deleteProject(db, project_id, user_id);

            await db.query('COMMIT');
			return res.json({result: "success"});
        }catch(error){
            await db.query('ROLLBACK');
            next(error);
        }finally{
            db.release();
        }
    },
}