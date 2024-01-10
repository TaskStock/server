const successMul = 1000;
const failMul = 800;

module.exports = {
    // todo 완료 시 추가되는 가치량
    plusLevel: (level) =>{
        const result = level * successMul;
        return result;
    },
    // todo 완료 취소 시 빼지는 가치량
    minusLevel: (level) =>{
        const result = level * -successMul;
        return result;
    },
    // todo 실패 시 빼지는 가치량
    failedTodo: (level) =>{
        const result = level * -failMul;
        return result;
    },
    // failedTodo를 원래대로
    cancelfailedTodo: (level) =>{
        const result = level * failMul;
        return result;
    },
    // todo의 level을 수정했을 때 high와 end의 변화량
    changeLevelForHighEnd: (from, to) =>{
        // level을 from 에서 to로
        const result = (to-from) * successMul;
        return result;
    },
    // todo의 level을 수정했을 때 low의 변화량
    changeLevelForLow: (from, to) =>{
        // level을 from 에서 to로
        const result = (to-from) * failMul;
        return result;
    },
}