const { zonedTimeToUtc, utcToZonedTime } = require('date-fns-tz');
const { startOfDay, startOfMonth, addHours, addMonths, addDays } = require('date-fns');

module.exports = {
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
    // 오늘 value의 정산시간을 utc로 반환
    getSettlementTimeInUTC: (timezone) =>{
        const nowUtc = new Date();  // 서버컴퓨터의 로컬 시간대를 포함한 utc
        const nowZoneTime = utcToZonedTime(nowUtc, timezone);   // 사용자의 로컬 시간대를 포함시킨 utc
        // date-fns-tz 함수들은 date객체를 반환하는데 이때 서버컴퓨터의 로컬 시간대를 반영하여 utc로 나타낸다.
        // 종속성을 제거하려고 했지만 실패했고 .toLocaleString()과 같은 함수는 로컬 시간대를 정상적으로 잘 뽑기 때문에 일단 이렇게 쓴다.

        const startOfToday = startOfDay(nowZoneTime); // utc이지만 로컬 시간대에 맞는 시작일을 제대로 구하고 있음
        const nextDay = addDays(startOfToday, 1);

        const resultUtc = zonedTimeToUtc(nextDay, timezone);

        return resultUtc;
    },
    // string인 utc를 받아서 timezone에 따라 해당 지역 정산시간으로 변환
    getSettlementTime: (utc, timezone) =>{
        const nowZoneTime = utcToZonedTime(utc, timezone);

        const startOfToday = startOfDay(nowZoneTime);
        const nextDay = addDays(startOfToday, 1);

        const resultUtc = zonedTimeToUtc(nextDay, timezone);

        return resultUtc;
    },
    // string인 utc를 받아서 timezone에 따라 해당 지역 시작시간으로 변환
    getStartOfDayTime: (utc, timezone) =>{
        const nowZoneTime = utcToZonedTime(utc, timezone);
        const startOfToday = startOfDay(nowZoneTime);
        const startOfTodayUTC = zonedTimeToUtc(startOfToday, timezone);

        return startOfTodayUTC;
    },
    // "2024-06"과 같은 문자열을 받아 해당 달의 시작 utc를 반환
    getStartOfMonthTime: (date, timezone) =>{
        const monthstart = utcToZonedTime(date, timezone);

        return monthstart;
    },
    // "2024-06"과 같은 문자열을 받아 다음 달의 시작 utc를 반환
    getNextMonthTime: (date, timezone) =>{
        const monthstart = utcToZonedTime(date, timezone);
        const nextMonth = addMonths(monthstart, 1);  // 무조건 30일을 더하는게 아니라 1월 31일 -> 2월 29일처럼 자동으로 맞춰준다.
        const nextMonthUTC = zonedTimeToUtc(nextMonth, timezone);

        return nextMonthUTC;
    },
    plusOneDay: (date, timezone) =>{
        const zonedDate = utcToZonedTime(date, timezone);
        const nextDay = addDays(zonedDate, 1);
        const nextDayUTC = zonedTimeToUtc(nextDay, timezone);

        return nextDayUTC;
    }
}