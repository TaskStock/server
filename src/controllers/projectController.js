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
        
        try{
            await projectModel.insertProject(user_id, name, public_range);
        }catch(error){
            next(error);
        }
    
        res.json({result: "success"});
    },
    updateProject: async(req, res, next) =>{
        const {project_id, name, public_range, finished} = req.body;
        const user_id = req.user.user_id;
        
        try{
            await projectModel.updateProject(project_id, user_id, name, public_range, finished);
        }catch(error){
            next(error);
        }
    
        res.json({result: "success"});
    },
    // 프로젝트와 해당 프로젝트의 todo들 반환
    readProjectWithTodos: async(req, res, next) =>{
        const project_id = req.params.project_id;
        const user_id = req.user.user_id;

        try{
            const project = await projectModel.readProject(project_id, user_id);
            const todos = await todoModel.readTodosUsingProject(project_id, user_id);
            res.json({project: project, todos: todos});
        }catch(error){
            next(error);
        }
    },
    readAllProjects: async(req, res, next) =>{
        const user_id = req.user.user_id;
        
        try{
            const projects = await projectModel.readAllProjects(user_id);
            res.json({projects: projects});
        }catch(error){
            next(error);
        }
    },
    deleteProject: async(req, res, next) =>{
        const {project_id} = req.body;
        const user_id = req.user.user_id;
        
        try{
            await projectModel.deleteProject(project_id, user_id);
        }catch(error){
            next(error);
        }
    
        res.json({result: "success"});
    },
}