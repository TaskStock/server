const { zonedTimeToUtc, utcToZonedTime } = require('date-fns-tz');
const { startOfDay, addHours } = require('date-fns');

module.exports = {
    // 2024-01-16 -> 2024-01-15T21:00:00.000Z (로컬이 Asia/Seoul 인 경우)
    localDateToUTCWith6AM: (date, timezone) =>{
        const local6am = date+"T06:00:00";
        const result = zonedTimeToUtc(local6am, timezone);
        return result;
    },
    localDateToUTCWithStartOfDay: (date, timezone) =>{
        const result = zonedTimeToUtc(date, timezone);
        return result;
    },
    UTCToLocalDate: (date, timezone) =>{
        const utcDate = date.toISOString();
        const localTimestamp = utcToZonedTime(utcDate, timezone); // utc 시간대 그대로이긴 한데 timezone은 적용되는 것 같긴함
        const result = localTimestamp.toLocaleDateString('en-CA');
        // toLocaleDateString 가 로컬시간대의 날짜를 뽑아내는데 배포서버에도 제대로 작동할지 모르겠음
        return result;
    },
    getSettlementTimeInUTC: (timezone) =>{
        const nowUtc = new Date();  // 서버컴퓨터의 로컬 시간대를 포함한 utc
        const nowZoneTime = utcToZonedTime(nowUtc, timezone);   // 사용자의 로컬 시간대를 포함시킨 utc
        // date-fns-tz 함수들은 date객체를 반환하는데 이때 서버컴퓨터의 로컬 시간대를 반영하여 utc로 나타낸다.
        // 종속성을 제거하려고 했지만 실패했고 .toLocaleString()과 같은 함수는 로컬 시간대를 정상적으로 잘 뽑기 때문에 일단 이렇게 쓴다.

        const startOfToday = startOfDay(nowZoneTime); // utc이지만 로컬 시간대에 맞는 시작일을 제대로 구하고 있음
        const sixAM = addHours(startOfToday, 6);   // 정산시간(6시)
        let result;
        if (nowZoneTime >= sixAM) {
            result = sixAM;
        } else {
            result = addHours(sixAM, -24);
        }
        // 결과를 UTC로 변환 - 이미 UTC인데? 필요한가?
        const resultUtc = zonedTimeToUtc(result, timezone);

        return resultUtc;
    },
}