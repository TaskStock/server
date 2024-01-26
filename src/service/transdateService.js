const { zonedTimeToUtc, utcToZonedTime } = require('date-fns-tz');
const { startOfDay, startOfMonth, addHours, addMonths, addDays } = require('date-fns');

module.exports = {
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
    // 내일 value의 정산시간을 utc로 반환
    getTommorowSettlementTimeInUTC: (timezone) =>{
        const nowUtc = new Date();
        const nowZoneTime = utcToZonedTime(nowUtc, timezone);

        const startOfToday = startOfDay(nowZoneTime);
        const next2Day = addDays(startOfToday, 2);

        const resultUtc = zonedTimeToUtc(next2Day, timezone);

        return resultUtc;
    },
    // 현재 날짜의 시작시간(정산시간 - 하루 와 같음)
    getStartToday: (timezone) =>{
        const nowUtc = new Date();
        const nowZoneTime = utcToZonedTime(nowUtc, timezone);

        const startOfToday = startOfDay(nowZoneTime);

        const resultUtc = zonedTimeToUtc(startOfToday, timezone);

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
    },
    minusOneDay: (date, timezone) =>{
        const zonedDate = utcToZonedTime(date, timezone);
        const nextDay = addDays(zonedDate, -1);
        const nextDayUTC = zonedTimeToUtc(nextDay, timezone);

        return nextDayUTC;
    }
}