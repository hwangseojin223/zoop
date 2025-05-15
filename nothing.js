// const a = 1;

// const plus = (a) => {a + 1}

// plus(a)

// console.log(a)

let a = 1;  // 객체로 값 감싸기

// 값을 변경하는 함수
function plus(obj) {
  obj += 1;  // 객체의 value 속성을 1 증가시킴
}

plus(a);  // 함수 호출로 a의 value가 1 증가
console.log(a);  // 2가 출력
