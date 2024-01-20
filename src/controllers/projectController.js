const projectModel = require('../models/projectModel.js');
const todoModel = require('../models/todoModel.js');
const retrospectModel = require('../models/retrospectModel.js');

module.exports = {
    newProject: async(req, res, next) =>{
        const {name, ispublic} = req.body;
        const user_id = req.user.user_id;
        
        try{
            await projectModel.insertProject(user_id, name, ispublic);
        }catch(error){
            next(error);
        }
    
        res.json({result: "success"});
    },
    updateProject: async(req, res, next) =>{
        const {project_id, name, ispublic} = req.body;
        const user_id = req.user.user_id;
        
        try{
            await projectModel.updateProject(project_id, user_id, name, ispublic);
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
            const todoCount = await todoModel.getTodoCount(user_id, project_id);
            const retrospectCount = await retrospectModel.getRetrospectCount(user_id, project_id);
            res.json({project: project, todos: todos, todoCount: todoCount, retrospectCount: retrospectCount});
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
}