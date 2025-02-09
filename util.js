// 넘어온 값이 빈값인지 체크합니다.
// !value 하면 생기는 논리적 오류를 제거하기 위해
// 명시적으로 value == 사용 // [], {} 도 빈값으로 처리

var isEmpty = function(value) {
   if( value == "" || value == null || value == undefined || ( value != null && typeof value == "object" && !Object.keys(value).length ) ) {
      return true;
    }
  else{
      return false;
  }
}

var nameWithCommas = function (x) {
  if (isNaN(x)) return "Invalid input";

  let parts = x.toString().split(".");
  
  // 정수 부분 쉼표 추가
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  if (x >= 1000) {
    // 입력값이 1000 이상인 경우: 정수 부분만 반환
    return parts[0];
  }

  if (x >= 10) {
    // 입력값이 10 이상 1000 미만인 경우: 소수점 두 자리 유지
    if (parts[1]) parts[1] = parts[1].substring(0, 2);
  } else if (x < 10 && parts[1]) {
    let totalDigits = 0;
    let foundNonZero = false;

    parts[1] = parts[1]
      .split("")
      .filter((digit) => {
        // 0이 아닌 숫자를 만났는지 확인
        if (digit !== "0") foundNonZero = true;

        // 유효 숫자를 만난 이후부터 처리
        if (foundNonZero) {
          totalDigits++;
          return totalDigits <= 3; // 숫자(0 포함) 3개까지 유지
        }

        // 유효 숫자를 만나기 전의 0은 그대로 보존
        return true;
      })
      .join("");
  }

  // 정수와 소수 부분 합치기
  return parts[1] ? parts.join(".") : parts[0];
};

var trim = function(str){
  return str.replace(/(\s*)/g,"");
}

module.exports.isEmpty = isEmpty;
module.exports.nameWithCommas = nameWithCommas;
module.exports.trim = trim;
