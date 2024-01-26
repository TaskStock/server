const successMul = 1000;
const failMul = 800;

module.exports = {
    // todo의 level을 수정했을 때 high와 end의 변화량
    changeLevelForHigh: (from, to) =>{
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
    // todo의 level을 수정했을 때 end의 변화량
    // check는 수정하는 todo가 체크되어있는 상태인지 여부
    // scheduler만 end를 깎으므로 scheduler만 false를 사용할 수 있음
    changeLevelForEnd: (from, to, check) =>{
        let result;
        if(check === true){
            result = (to-from) * successMul;
        }else{
            result = (to-from) * failMul;
        }
        return result;
    }
}