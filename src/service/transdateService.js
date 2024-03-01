const { zonedTimeToUtc, utcToZonedTime } = require('date-fns-tz');
const { startOfDay, startOfMonth, addHours, addMonths, addDays, format } = require('date-fns');

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
        const nowZoneTime = utcToZonedTime(date, timezone);
        const startOfNowMonth = startOfMonth(nowZoneTime);
        const startOfMonthUTC = zonedTimeToUtc(startOfNowMonth, timezone);

        return startOfMonthUTC;
    },
    // "2024-06"과 같은 문자열을 받아 다음 달의 시작 utc를 반환
    getNextMonthTime: (date, timezone) =>{
        const monthstart = utcToZonedTime(date, timezone);
        const nextMonth = addMonths(monthstart, 1);  // 무조건 30일을 더하는게 아니라 1월 31일 -> 2월 29일처럼 자동으로 맞춰준다.
        const startOfNowMonth = startOfMonth(nextMonth);
        const nextMonthUTC = zonedTimeToUtc(startOfNowMonth, timezone);

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
        const previousDay = addDays(zonedDate, -1);
        const previousDayUTC = zonedTimeToUtc(previousDay, timezone);

        return previousDayUTC;
    },
    minusOneMonth: (date, timezone) =>{
        const zonedDate = utcToZonedTime(date, timezone);
        const previousMonth = addMonths(zonedDate, -1);
        const previousMonthUTC = zonedTimeToUtc(previousMonth, timezone);

        return previousMonthUTC;
    },
    // 스케쥴링에서 사용
    // 오늘 무슨 요일인지 반환
    // 스케쥴링은 정산시간에 실행되므로 하루 빼줘야함
    getDayoftheweek: (timezone) =>{
        const now = utcToZonedTime(new Date(), timezone);
        const previousDay = addDays(now, -1);

        const dayOfWeek = parseInt(format(previousDay, 'i', { timeZone: timezone }), 10);
        // 0 : 일요일
        // 1 : 월요일
        // 2 : 화요일
        // 3 : 수요일
        // 4 : 목요일
        // 5 : 금요일
        // 6 : 토요일

        return dayOfWeek;
    },
    // 알람 스케쥴링
    getAlarmTime11PM: (timezone) =>{
        const nowUtc = new Date();
        const nowZoneTime = utcToZonedTime(nowUtc, timezone);

        const adjustTime = addHours(nowZoneTime, 1);    // 23시 기준이므로 임의로 1시간 더함
        const startOfToday = startOfDay(adjustTime);
        const alarmTime = addHours(startOfToday, 23);

        const resultUtc = zonedTimeToUtc(alarmTime, timezone);

        return resultUtc;
    },
    getAlarmTime9AM: (timezone) =>{
        const nowUtc = new Date();
        const nowZoneTime = utcToZonedTime(nowUtc, timezone);

        const adjustTime = addHours(nowZoneTime, 15);    // 09시 기준이므로 임의로 15시간 더함
        const startOfToday = startOfDay(adjustTime);
        const alarmTime = addHours(startOfToday, 9);

        const resultUtc = zonedTimeToUtc(alarmTime, timezone);

        return resultUtc;
    },
}