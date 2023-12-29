const projectModel = require('../models/projectModel.js');
const todoModel = require('../models/todoModel.js');

module.exports = {
    newProject: async(req, res, next) =>{
        const {user_id, name, ispublic} = req.body;
        
        try{
            await projectModel.insertProject(user_id, name, ispublic);
        }catch(error){
            next(error);
        }
    
        res.json({result: "success"});
    },
    updateProject: async(req, res, next) =>{
        const {project_id, user_id, name, ispublic} = req.body;
        
        try{
            await projectModel.updateProject(project_id, user_id, name, ispublic);
        }catch(error){
            next(error);
        }
    
        res.json({result: "success"});
    },
    writeRetrospect: async(req, res, next) =>{
        const {project_id, user_id, retrospect} = req.body;
        
        try{
            await projectModel.updateRetrospect(project_id, user_id, retrospect);
        }catch(error){
            next(error);
        }
    
        res.json({result: "success"});
    },
    // 프로젝트와 해당 프로젝트의 todo들 반환
    readProjectWithTodos: async(req, res, next) =>{
        const {project_id, user_id} = req.body;
        
        try{
            const project = await projectModel.readProject(project_id, user_id);
            const todos = await todoModel.readTodosUsingProject(project_id, user_id);
            res.json({project: project, todos: todos});
        }catch(error){
            next(error);
        }
    },
    readAllProjects: async(req, res, next) =>{
        const {user_id} = req.body;
        
        try{
            const projects = await projectModel.readAllProjects(user_id);
            res.json({projects: projects});
        }catch(error){
            next(error);
        }
    },
}