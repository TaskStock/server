module.exports = {
    // todo 완료 시 추가되는 가치량
    plusLevel: (level) =>{
        const result = level * 1000;
        return result;
    },
    // todo 완료 취소 시 빼지는 가치량
    minusLevel: (level) =>{
        const result = level * -1000;
        return result;
    },
}