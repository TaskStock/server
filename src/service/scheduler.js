const schedule = require('node-schedule');

const transdate = require('./transdateService.js');
const calculate = require('./calculateService.js');
const notice = require('./noticeService.js');

const valueModel = require('../models/valueModel.js');
const accountModel = require('../models/accountModel.js');
const todoModel = require('../models/todoModel.js');

const stockitemModel = require('../models/stockitemModel.js');
const sivalueModel = require('../models/sivalueModel.js');
const sistatisticsModel = require('../models/sistatisticsModel.js');

const db = require('../config/db.js');

// 정산 작업
// 1. 각 타임존에 대해 다음 정산시간에 대한 스케쥴러를 설정
// 1-1. timezone의 다음 정산시간을 transdate에서 받아온다.
// 1-2. 해당 정산시간에 대해 scheduleJob을 설정한다
// 2. 각 유저에 대해 정산작업 실행
// 2-1. timezone에 해당하는 모든 유저 정보를 가져온다(user_id)
// 2-2. 모든 유저에 대해서는 비동기적으로 작업을 실행한다.
// 2-3. 각 유저는 '정산시간'에 해당하는 '자신'의 value를 가져온다.
// 2-3-1. timezone에 대한 정보는 유저를 가져올 때 사용했으므로 고려할 필요 없다. 즉, value에 region필드는 빼도 된다.
// 2-4. 각 유저의 정산대상에 해당하는 todo들을 가져온다.
// 2-5. 해당 todo들을 모두 확인하면서 check에 따라 value에 수치를 반영한다. 이때 calculateService를 이용한다.
// 3. 다음 날짜의 value 생성
// 3-1. 정산작업이 끝났다면 반영된 value로 다음 날짜의 value를 생성한다.
// 4. 미리 만들어진 todo 반영
// 4-1. value를 생성하고 미리 만들어진 todo들이 있는지 확인하고 반영한다.
// 4-2. user의 value 필드 업데이트
// 5. 다음 스케쥴러 설정
// 5-1. 모든 유저의 작업이 끝났다면 timezone에 대해 다음 스케쥴러를 설정한다.

async function settlementJob(cn, user_id, startTime, sttime, tommorowsttime){
    let value = await valueModel.getValueOne(cn, user_id, sttime);

    if(value === undefined){    // 해당되는 날짜의 value가 없는 경우
        return;
    }

    // check==false인 todo만 가져와서 value에 반영
    const todos = await todoModel.readTodoForSchedulerWithCheckFalse(cn, user_id, startTime, sttime);
    for(let i=0;i<todos.length;i++){
        const end = value.end - calculate.changeLevelForEnd(0, todos[i].level, false);
        value = await valueModel.updateValueEnd(cn, value.value_id, end);
    }

    // 3. 다음 날짜의 value 생성
    const start = value.end;
    const end = start;
    const low = start;
    const high = start;

    let tommorowValue = await valueModel.createByExistUser(cn, user_id, tommorowsttime, start, end, low, high);

    // 4. 미리 만들어진 todo 반영
    const maked_todos = await todoModel.readTodoForScheduler(cn, user_id, sttime, tommorowsttime);

    const tv_start = tommorowValue.start;
    let tv_end = tommorowValue.end;
    let tv_low = tommorowValue.low;
    let tv_high = tommorowValue.high;

    for(let i=0;i<maked_todos.length;i++){
        const level = maked_todos[i].level;
        tv_low = tv_low - calculate.changeLevelForLow(0, level);
        tv_high = tv_high + calculate.changeLevelForHigh(0, level);

        if(maked_todos[i].check === true){
            tv_end = tv_end + calculate.changeLevelForEnd(0, level, true);
        }

    }

    await valueModel.updateValueForMakedTodos(cn, tommorowValue.value_id, tv_end, tv_low, tv_high);

    // 4-2. user의 value 필드 업데이트
    const percentage = calculateService.rateOfIncrease(tv_start, tv_end);
    await accountModel.updateValueField(cn, user_id, tv_end, percentage);
}

async function settlementJobManager(timezone, startTime, sttime, tommorowsttime){
    const cn = await db.connect();

    try{
        await cn.query('BEGIN');

		const user_ids = await accountModel.getUsersIdByRegion(cn, timezone);
    
        if(user_ids === undefined){
            return;
        }    

        await Promise.all(
            user_ids.map(user => 
                settlementJob(cn, user.user_id, startTime, sttime, tommorowsttime)
            )
        );

        await cn.query('COMMIT');
    } catch(error){
        await cn.query('ROLLBACK');
        console.log('error : ', error);
    }finally{
        cn.release();
    }
}

// 시장 종목에 대한 정산 작업
// sivalue의 성공률은 todo로 등록하고 완료처리 될 때 반영되므로 필요x
// stockitem에 대해 오늘 기록을 전날로 옮기고 오늘 기록은 0으로 초기화
// 새로운 sivalue 생성
// 추후 통계정보에 대한 추가 스케쥴링 작업이 필요할 수 있음
// 1. 각 종목에 대해 비동기적으로 정산작업 실행
// 2. Stockitem의 take_count, success_count를 y_take_count, y_success_count로 옮기고 0으로 초기화
// 3. 새로운 SIValue 생성
// 4. 통계에 대한 추가 스케쥴링 작업

async function stockitemJob(cn, stockitem_id, tommorowsttime, timezone){
    // 2. Stockitem의 take_count, success_count를 y_take_count, y_success_count로 옮기고 0으로 초기화
    const updated_stockitem = await stockitemModel.updateStockitemInScheduler(cn, stockitem_id);

    // 3. 새로운 SIValue 생성
    await sivalueModel.createSivalue(cn, stockitem_id, tommorowsttime);

    // 4. 통계에 대한 추가 작업
    const dayOfWeek = transdate.getDayoftheweek(timezone);
    await sistatisticsModel.updateSistatistics(cn, stockitem_id, updated_stockitem.y_take_count, updated_stockitem.y_success_count, dayOfWeek);
}

async function stockitemJobManager(timezone, tommorowsttime){
    const cn = await db.connect();

    try{
        await cn.query('BEGIN');

        const stockitems = await stockitemModel.getStockitemsWithRegion(cn, timezone);
    
        if(stockitems.length===0){
            // console.log('stockitem length : 0');
            return;
        }    
    
        await Promise.all(
            stockitems.map(si => 
                stockitemJob(cn, si.stockitem_id, tommorowsttime, timezone)
            )
        );

        await cn.query('COMMIT');
    } catch(error){
        await cn.query('ROLLBACK');
        console.log('error : ', error);
    }finally{
        cn.release();
    }
}

function settlementScheduler(timezone){
    const startTime = transdate.getStartToday(timezone);
    const nextSettlement = transdate.getSettlementTimeInUTC(timezone);
    const tommorowSettlement = transdate.getTommorowSettlementTimeInUTC(timezone);
    
    // const test = new Date();
    // test.setTime(test.getTime()+3000);

    schedule.scheduleJob(nextSettlement, async function() {
        // 비동기로 각 스케쥴러 작업 실행

        await Promise.allSettled([
            settlementJobManager(timezone, startTime, nextSettlement, tommorowSettlement),
            stockitemJobManager(timezone, tommorowSettlement)
        ])
        .then((results)=>{
            results.forEach((result, index)=>{
                if(result.status !== 'fulfilled'){
                    console.log(`${index}번째 스케쥴러 실패:`, result.reason);
                }
            });
        });

        settlementScheduler(timezone); // 5. 다음 날짜에 대한 재스케줄링
    });
}

// 알림 스케쥴링
function alarmScheduler(timezone){
    const nextAlarm = transdate.getAlarmTimeInUTC(timezone);
    
    // const test = new Date();
    // test.setTime(test.getTime()+3000);

    schedule.scheduleJob(nextAlarm, async function() {
        // 비동기로 각 스케쥴러 작업 실행

        await Promise.allSettled([
            notice.sendMultiPushBeforeMidnight(timezone)
        ])
        .then((results)=>{
            results.forEach((result, index)=>{
                if(result.status !== 'fulfilled'){
                    console.log(`${index}번째 스케쥴러 실패:`, result.reason);
                }
            });
        });

        alarmScheduler(timezone);
    });
}

module.exports = {
    scheduling: () => {
        // const timeZones = ['Asia/Seoul']; // 타임존 목록
        const timeZones = ['America/New_York', 'Asia/Seoul']; // 타임존 목록
        timeZones.forEach(tz => {settlementScheduler(tz), alarmScheduler(tz)}); // 각 타임존에 대해 함수 호출
    }
}