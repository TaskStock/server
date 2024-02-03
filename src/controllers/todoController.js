const todoModel = require('../models/todoModel.js');
const valueModel = require('../models/valueModel.js');
const accountModel = require('../models/accountModel.js');

const stockitemModel = require('../models/stockitemModel.js');
const sivalueModel = require('../models/sivalueModel.js');
const simapModel = require('../models/simapModel.js');

const transdate = require('../service/transdateService.js');
const calculate = require('../service/calculateService.js');

module.exports = {
    newTodo: async(req, res, next) =>{
        const {content, level, project_id, nowUTC, stockitem_id} = req.body;
        const user_id = req.user.user_id; // passport를 통과한 유저객체에서 user_id를 받아옴
        const region = req.user.region;

        let inserted_todo;
        try{
            const start_date = transdate.getStartOfDayTime(nowUTC, region);
            const end_date = transdate.plusOneDay(start_date, region);

            const index = await todoModel.getHighestIndex(user_id, start_date, end_date);

            let nextIndex = 1;
            if(index !== undefined){
                nextIndex = index.index + 1;
            }

            inserted_todo = await todoModel.insertTodo(content, level, user_id, project_id, nowUTC, nextIndex, stockitem_id);

            if(level !== 0){
                const sttime = transdate.getSettlementTime(nowUTC, region).toISOString();
                const value = await valueModel.getRecentValue(user_id);
                
                if(value === undefined){
                    return res.status(400).json({result: "fail", message: "value가 존재하지 않습니다."});
                }else if(value.date.toISOString() === sttime){
                    const value_id = value.value_id;
                    const start = value.start;
                    const end = value.end;
                    const updateLow = value.low - calculate.changeLevelForLow(0, level);
                    const updateHigh = value.high + calculate.changeLevelForHigh(0, level);
    
                    await valueModel.updateValue(user_id, value_id, start, end, updateLow, updateHigh);
                }
            }

            // 종목 정보 업데이트
            if(stockitem_id !== null){
                const resultUtc = transdate.getSettlementTimeInUTC(region).toISOString();
                const previousDayUtc = transdate.minusOneDay(resultUtc, region).toISOString();
                if(nowUTC >= previousDayUtc && nowUTC < resultUtc){ // 오늘 추가한 todo만
                    const updated_stockitem = await stockitemModel.increaseTakecount(stockitem_id);
                    const success_rate = updated_stockitem.success_count/updated_stockitem.take_count;
                    const sttime = transdate.getSettlementTimeInUTC(region);
                    await sivalueModel.updateSuccessrate(stockitem_id, sttime, success_rate);

                    // SIMap 업데이트
                    const simap = await simapModel.getSimapid(user_id, stockitem_id);
                    if(simap === undefined){
                        await simapModel.createSimap(user_id, stockitem_id);
                    }else{
                        await simapModel.increaseTakecount(simap.simap_id);
                    }
                }
            }

        }catch(error){
            next(error);
        }
        res.json({result: "success", todo_id: inserted_todo.todo_id, index: inserted_todo.index});
    },
    readTodo: async(req, res, next) =>{
        // 같은 날짜의 todo들이더라도 정산시간이 6시이므로 수정불가능한(?) todo가 불러와질 수 있음에 주의 -> 정산시간이 0시로 변경되면서 해결됨
        const date = req.query.date;
        // date : 클라이언트로부터 받은 시간 정보를 UTC 기준 timestamp로 변환
        const user_id = req.user.user_id;
        const region = req.user.region;

        const start_date = transdate.getStartOfDayTime(date, region);
        const end_date = transdate.plusOneDay(start_date, region);
        
        let todos;
        try{
            todos = await todoModel.readTodo(user_id, start_date, end_date);            
        }catch(error){
            next(error);
        }
        
        res.json({todos: todos});
    },
    readTodoOneMonth: async(req, res, next) =>{
        const date = req.query.date;
        // date : "2024-06"
        const user_id = req.user.user_id;
        const region = req.user.region;

        const start_date = transdate.getStartOfMonthTime(date, region);
        const end_date = transdate.getNextMonthTime(date, region);
        
        let todos;
        try{
            todos = await todoModel.readTodo(user_id, start_date, end_date);
        }catch(error){
            next(error);
        }
        
        res.json({todos: todos});
    },
    updateContentAndProject: async(req, res, next) =>{
        const {todo_id, content, project_id} = req.body;
        const user_id = req.user.user_id;
        
        try{
            await todoModel.updateContentAndProject(todo_id, content, user_id, project_id);
        }catch(error){
            next(error);
        }
        
        res.json({result: "success"});
    },
    updateTodo: async(req, res, next) =>{
        const {todo_id, content, level, project_id} = req.body;
        const user_id = req.user.user_id;
        const region = req.user.region;

        try{
            const todo = await todoModel.readTodoUsingTodoId(todo_id, user_id);
            await todoModel.updateTodo(todo_id, content, level, user_id, project_id);

            if(todo.level !== level){
                const sttime = transdate.getSettlementTimeInUTC(region).toISOString();
                const value = await valueModel.getRecentValue(user_id);
                
                if(value === undefined){
                    return res.status(400).json({result: "fail", message: "value가 존재하지 않습니다."});
                }else if(value.date.toISOString() !== sttime){
                    return res.status(400).json({result: "fail", message: "오늘 날짜의 value가 존재하지 않습니다."});
                }else{
                    const value_id = value.value_id;
                    const start = value.start;
                    let end = value.end;
                    const updateLow = value.low - calculate.changeLevelForLow(todo.level, level);
                    const updateHigh = value.high + calculate.changeLevelForHigh(todo.level, level);

                    if(todo.check === true){
                        end = value.end + calculate.changeLevelForEnd(todo.level, level, true);
                        const percentage = calculate.rateOfIncrease(start, end);
                        await accountModel.updateValueField(user_id, end, percentage);
                    }
    
                    await valueModel.updateValue(user_id, value_id, start, end, updateLow, updateHigh);
                }
            }
        }catch(error){
            next(error);
        }
        
        res.json({result: "success"});
    },
    updateCheck: async(req, res, next) =>{
        // check가 true -> true 인 경우는 검사하지 않으므로 true -> false, false -> true 인 경우만 보낼 것
        const {todo_id, check} = req.body;
        // check : true or false
        const user_id = req.user.user_id;
        const region = req.user.region;
        
        try{
            const todo = await todoModel.updateCheck(todo_id, user_id, check);

            const resultUtc = transdate.getSettlementTimeInUTC(region);
            const previousDayUtc = transdate.minusOneDay(resultUtc, region);

            if(todo === undefined){
                return res.status(400).json({result: "fail", message: "해당 todo는 존재하지 않습니다."});
            }

            if(todo.level !== 0 && todo.date >= previousDayUtc && todo.date < resultUtc){  // 아직 정산안됐고 오늘 날짜인 경우만
                let changeAmount;
                if(check===true){
                    changeAmount = calculate.changeLevelForEnd(0, todo.level, true);
                }else if(check===false){
                    changeAmount = calculate.changeLevelForEnd(todo.level, 0, true);
                }
                const updated_value = await valueModel.updateValueBecauseTodoComplete(user_id, changeAmount, resultUtc);
                const u_start = updated_value.start;
                const u_end = updated_value.end;
                const percentage = calculate.rateOfIncrease(u_start, u_end);
                await accountModel.updateValueField(user_id, u_end, percentage);
            }

            // 종목 통계정보 업데이트
            if(todo.stockitem_id !== null && todo.date >= previousDayUtc && todo.date < resultUtc){
                let updated_stockitem;
                if(check === true){
                    updated_stockitem = await stockitemModel.increaseSuccesscount(todo.stockitem_id);
                }else if(check === false){
                    updated_stockitem = await stockitemModel.decreaseSuccesscount(todo.stockitem_id);
                }
                const success_rate = updated_stockitem.success_count/updated_stockitem.take_count;
                const sttime = transdate.getSettlementTimeInUTC(region);
                await sivalueModel.updateSuccessrate(todo.stockitem_id, sttime, success_rate);
            }

        }catch(error){
            next(error);
        }
        
        res.json({result: "success"});
    },
    // 유저 id와 todo id를 받아 해당 todo 삭제
    // 해당 todo와 관련된 반복설정도 삭제됨
    deleteTodo: async(req, res, next) =>{
        const {todo_id} = req.body;
        const user_id = req.user.user_id;
        const region = req.user.region;
        
        try{
            const todo = await todoModel.readTodoUsingTodoId(todo_id, user_id);

            if(todo === undefined){
                return res.status(400).json({result: "fail", message: "todo가 존재하지 않습니다."});
            }

            await todoModel.deleteTodo(todo_id, user_id);

            if(todo.level !== 0){
                const sttime = transdate.getSettlementTimeInUTC(region).toISOString();
                const value = await valueModel.getRecentValue(user_id);
                
                if(value === undefined){
                    return res.status(400).json({result: "fail", message: "value가 존재하지 않습니다."});
                }else if(value.date.toISOString() !== sttime){
                    return res.status(400).json({result: "fail", message: "오늘 날짜의 value가 아닙니다."});
                }else{
                    const value_id = value.value_id;
                    const start = value.start;
                    let end = value.end;
                    const updateLow = value.low - calculate.changeLevelForLow(todo.level, 0);
                    const updateHigh = value.high + calculate.changeLevelForHigh(todo.level, 0);

                    if(todo.check === true){
                        end = value.end + calculate.changeLevelForEnd(todo.level, 0, true);
                        const percentage = calculate.rateOfIncrease(start, end);
                        await accountModel.updateValueField(user_id, end, percentage);
                    }
    
                    await valueModel.updateValue(user_id, value_id, start, end, updateLow, updateHigh);
                }
            }

            // 종목 업데이트
            if(todo.stockitem_id !== null){
                const resultUtc = transdate.getSettlementTimeInUTC(region);
                const previousDayUtc = transdate.minusOneDay(resultUtc, region);
                if(todo.date >= previousDayUtc && todo.date < resultUtc){   // 오늘 날짜의 todo만
                    let updated_stockitem;
                    if(todo.check === true){
                        updated_stockitem = await stockitemModel.decreaseTwocount(todo.stockitem_id);
                    }else if(todo.check === false){
                        updated_stockitem = await stockitemModel.decreaseTakecount(todo.stockitem_id);
                    }
                    const success_rate = updated_stockitem.success_count/updated_stockitem.take_count;
                    const sttime = transdate.getSettlementTimeInUTC(region);
                    await sivalueModel.updateSuccessrate(todo.stockitem_id, sttime, success_rate);
                }
            }
        }catch(error){
            next(error);
        }
        
        res.json({result: "success"});
    },
    tomorrowTodo: async(req, res, next) =>{
        const {todo_id} = req.body;
        const user_id = req.user.user_id;
        const region = req.user.region;
        
        try{
            const todo = await todoModel.readTodoUsingTodoId(todo_id, user_id);
            if(todo === undefined){
                return res.status(400).json({result: "fail", message: "todo가 존재하지 않습니다."});
            }else if(todo.check === true){
                return res.status(400).json({result: "fail", message: "완료되지 않은 todo만 미룰 수 있습니다."});
            }else{
                if(todo.level !== 0){
                    const sttime = transdate.getSettlementTime(todo.date, region).toISOString();
                    const value = await valueModel.getRecentValue(user_id);
                    
                    if(value === undefined){
                        return res.status(400).json({result: "fail", message: "value가 존재하지 않습니다."});
                    }else if(value.date.toISOString() === sttime){
                        const value_id = value.value_id;
                        const start = value.start;
                        const end = value.end;
                        const updateLow = value.low - calculate.changeLevelForLow(todo.level, 0);
                        const updateHigh = value.high + calculate.changeLevelForHigh(todo.level, 0);
        
                        await valueModel.updateValue(user_id, value_id, start, end, updateLow, updateHigh);
                    }else if(value.date.toISOString() > sttime){
                        return res.status(400).json({result: "fail", message: "아직 정산되지 않은 todo만 미룰 수 있습니다."});
                    }
                }

                const tomorrow = transdate.plusOneDay(todo.date, region);
                await todoModel.updateTodoDate(todo_id, user_id, tomorrow);
            }
        }catch(error){
            next(error);
        }
        
        res.json({result: "success"});
    },
    updateIndex: async(req, res, next) =>{
        const {changed_todos} = req.body;
        const user_id = req.user.user_id;
        
        try{
            // for(let i=0;i<changed_todos.length;i++){
            //     await todoModel.updateIndex(changed_todos[i].todo_id, user_id, changed_todos[i].changed_index);
            // }

            // 각 업데이트는 비동기적으로 실행하고 모든 작업이 끝날때까지 대기
            await Promise.all(
                changed_todos.map(todo =>
                    todoModel.updateIndex(todo.todo_id, user_id, todo.changed_index)
                )
            );
        }catch(error){
            next(error);
        }
        
        res.json({result: "success"});
    },
}