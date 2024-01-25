const schedule = require('node-schedule');

const transdate = require('./transdateService.js');
const calculate = require('./calculateService.js');

const valueModel = require('../models/valueModel.js');
const accountModel = require('../models/accountModel.js');

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
// 5. 다음 스케쥴러 설정
// 5-1. 모든 유저의 작업이 끝났다면 timezone에 대해 다음 스케쥴러를 설정한다.

function settlementJob(timezone, sttime){
    
}

function scheduling(timeZone) {
  const nextSettlement = transdate.getSettlementTimeInUTC(timeZone);

  schedule.scheduleJob(nextSettlement, async function() {
    settlementJob(timeZone, nextSettlement);

    scheduling(timeZone); // 다음 날짜에 대한 재스케줄링
  });
}

// 예시 타임존
const timeZones = ['America/New_York', 'Asia/Seoul']; // 타임존 목록
timeZones.forEach(tz => scheduling(tz)); // 각 타임존에 대해 함수 호출