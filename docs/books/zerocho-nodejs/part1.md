## 제로초의 Node.js 교과서 섹션 1 요약

### 2.1 호출 스택, 이벤트 루프

호출 스택은 실행 컨텍스트와 밀접한 연관이 있으며, 이벤트 루프와 더불어 JS의 동작 방식을 이해하는 데 필수적으로 공부해야 할 개념이다.

#### 2.1.1 호출 스택

```js
function first() {
  second();
  console.log("첫 번째");
}

function second() {
  third();
  console.log("두 번째");
}

function third() {
  console.log("세 번째");
}

first();
```

위 코드의 실행 결과는 아래와 같이 예측할 수 있다.

```
세 번째
두 번째
첫 번째
```

함수의 호출과 실행을 호출 스택과 연관지어 생각해보면, 다음과 같은 과정을 거친다고 생각할 수 있기 때문이다.

1. first() 호출, second() 호출 코드 실행
2. second() 호출, third() 호출 코드 실행
3. third() 호출, console.log() 실행 -> third()의 실행 끝
4. second() 내부의 console.log() 실행 -> second()의 실행 끝
5. first() 내부의 console.log() 실행 -> first()의 실행 끝

단, 실제 호출 스택 내부에서 최하단에 위치한 것은 '전역 실행 컨텍스트'에 해당하는 'Anonymous'가 위치한다. (크롬 브라우저 기준)

과정을 살펴보면 각 함수 호출 순서의 역순으로 실행되는 것을 볼 수 있으며, 호출 스택에서 실행이 완료된 함수는 스택에서 제거된다.

함수의 실행 컨텍스트 생성과 제거 과정이 LIFO와 동일하게 이루어지기 때문에 호출 '스택'이라고 불리는 것.

그런데 아래와 같은 비동기 코드는 호출 스택의 개념만으로는 설명이 어렵다.

```js
function run() {
  console.log("3초 후 실행");
}
console.log("시작");
setTimeout(run, 3000);
console.log("끝");
```

단순 직관으로 해석하면 실행 결과는 아래와 같지만,

```
시작
3초 후 실행
끝
```

실제 실행 결과는 다음과 같기 때문이다.

```
시작
끝
3초 후 실행
```

이러한 비동기 코드의 실행을 설명할 때는 '이벤트 루프'의 개념도 활용해야한다.

#### 2.1.2 이벤트 루프

이벤트 루프는 자바스크립트가 싱글 스레드 기반의 언어이면서 비동기 작업을 수행할 수 있는 그 핵심적인 이유에 해당한다. 일단 모든 함수는 호출되면 호출 스택에 실행 컨텍스트를 적재하지만, 특정 함수들의 실행 컨텍스트는 Web API(백그라운드 등)에 의해 병렬 처리된다. Web API는 브라우저에 의해 제공되며, 실행 컨텍스트의 처리가 완료되면 Web API는 콜백 함수를 그 종류에 따라 마이크로 태스크 큐, 또는 매크로 태스크 큐 등으로 전달한다. 그리고 여기서 이벤트 루프가 해당 큐들에 적재된 콜백 함수들을 호출 스택이 전부 비었을 때 우선순위대로 끌어오는 것이다.

이벤트 루프에 대한 기본 개념은 이 정도만 알고 있어도 충분할 것 같다.

추가로, 태스크 큐에서 `Promise`의 후속 처리 메서드와 `process.nextTick`이 타이머 함수들에 비해 높은 우선순위를 갖는다는 것을 알아두자.

### 2.2 ES2015+ (ES6+)

#### 2.2.1 const, let

ES6 문법부터 변수를 선언할 때 const(const는 상수 선언에 사용된다)와 let의 사용이 가능해졌다. ''사용이 가능해졌다"고 표현했지만, 사실상 대체하는 문법이다. 기존 (ES5 이전)에 사용하던 var 키워드로 선언된 변수와 어떤 차이점을 갖는지 알아보자.

- 블록 스코프를 갖는다. (var은 함수 스코프)

```js
if (true) {
  var x = 3;
}
console.log(x); // 3

if (true) {
  const y = 3;
}
console.log(y); // Uncaught ReferenceError: y is not defined
```

위 예제 코드에서 알 수 있듯, var 변수 x는 함수 스코프를 갖기 때문에 if, for, while 등이 갖는 블록 스코프 외부의 위치에서도 참조하거나 변경될 수 있다. const 상수 y는 블록 스코프를 갖기 때문에, if가 갖는 블록 스코프 내에서만 참조할 수 있는 것이다.

이외에 const와 let이 갖는 특징은 다음과 같다.

- const : 재선언, 재할당 모두 불가능.
- let : 재선언 불가능, 재할당 가능.

#### 2.2.2 템플릿 문자열 (템플릿 리터럴)

ES6부터는 템플릿 리터럴의 사용이 가능해져 문자열 내 동적인 값을 삽입하기 매우 쉬워졌다.

```js
// ES5 이전
var snackFee = "1000";
var statement1 = "이 과자는" + snackFee + "원 입니다.";

// ES6 이후
const statement2 = `이 과자는 ${snackFee}원 입니다.`;
```

#### 2.2.3 객체 리터럴

ES5 시절의 객체 표현 방법은 다음과 같았다고 한다.

```js
var sayNode = function () {
  console.log("Node");
};

var es = "ES";
var oldObject = {
  sayJS: function () {
    console.log("JS");
  },
  sayNode: sayNode,
};
oldObject[es + 6] = "Fantastic";
oldObject.sayNode(); // Node
oldObject.sayJS(); // JS
console.log(oldObject.ES6); // Fantastic
```

ES6에서 도입된 객체 리터럴 표현을 살펴보자.

```js
const newObject = {
  sayJS() {
    console.log("JS");
  },
  sayNode,
  [es + 6]: "Fantastic",
};
newObject.sayNode(); // Node
newObject.sayJS(); // JS
console.log(newObject.ES6); // Fantastic
```

객체의 멤버로 함수를 할당할 때 메서드에 :function 키워드를 생략할 수 있는 점, 멤버의 키와 값의 내용이 동일할 때 하나를 생략할 수 있는 점, 구조 내부에서 멤버의 키를 지정할 때 [변수 + 값]과 같이 동적인 방식으로 구성해줄 수 있는 점 등이 객체를 선언할 때 매우 큰 편의성을 가져다 주었다.

#### 2.2.4 화살표 함수

화살표 함수는 JS에서 함수가 변수에 할당될 수 있고, 인자로 전달되거나 어떤 함수의 결과로 반환될 수 있는 일급 객체의 특성을 갖고 있는 것을 눈으로 확실하게 확인할 수 있도록 하는 직관적인 문법이다.

다음과 같이 동일한 기능을 수행하는 두 함수를 각각 일반 표현식과 화살표 함수 표현식으로 작성할 수 있다.

```js
function add1(a, b) {
  return a + b;
}

const add2 = (a, b) => {
  return a + b;
};
```

여기서 add2는 상수로 선언되었지만, 함수를 갖고 있기 때문에 함수로서 활용될 수 있는 것이다. 참고로 add2는 다음과 같이 작성될 수도 있다.

```js
const add3 = (a, b) => a + b;
const add4 = (a, b) => a + b;
```

스코프 내 반환문(return)만 존재할 경우는 저렇게 스코프를 나타내는 중괄호를 생략하고, return 키워드 또한 생략할 수 있다.

그렇지만 축약된 함수 표현식이 항상 좋은 가독성을 이끌어내는 것은 아니므로... 사용에 주의를 기울이자.

축약 표현에서 다음과 같은 상황도 주의해야한다.

```js
const add5 = (a, b) => {
  x, y;
}; // X
```

위 표현식은 언뜻 보면 맞는 것 같지만 JS 엔진의 입장에서 add5 함수가 객체를 반환하는 것인지, 객체를 표현하기 위해 사용한 저 중괄호 쌍이 add5 함수의 스코프를 나타내는 것인지 알 수가 없다. 따라서 축약 표현 사용 시 객체를 반환하는 상황에서는...

```js
const add6 = (a, b) => ({ x, y });
```

위와 같이 객체를 소괄호 쌍으로 감싸주는 것을 잊으면 안된다.

이와 같이 화살표 함수는 기존 함수 표현 방식에 비해 훨씬 간결한 표현들을 지원한다는 장점이 있지만, 기존의 함수를 완전히 대체하지는 않는다.

그 이유는 "this" 때문이다.

- 기존 함수의 this

```js
var relationship1 = {
  name: "zero",
  friends: ["nero", "hero", "xero"],
  logFriends: function () {
    var that = this;
    this.friends.forEach(function (friend) {
      console.log(that.name, friend);
    });
  },
};
relationship1.logFriends();
```

여기서 변수 that에 저장되는 this는 logFriends의 this이므로, friends 배열을 forEach로 순회하는 부분의 함수에서 이를 활용하도록 하기 위해서 that으로 저장하는 것을 볼 수 있다. forEach 메소드 내 함수의 this는 또 개별적인 this를 갖기 때문에 아마 name 속성을 인식하지 못할 것이다.

- 화살표 함수의 this

```js
const relationship2 = {
  name: "zero",
  friends: ["nero", "hero", "xero"],
  logFriends() {
    this.friends.forEach((friend) => {
      console.log(this.name, friend);
    });
  },
};
relationship2.logFriends();
```

화살표 함수에서 사용하는 this의 경우, 자신을 포함하는 함수의 this를 물려받는다.

그래서 this.name에서의 this와 this.friends.forEach()에서의 this는 동일하다. 따라서 이렇게 부모의 this를 그대로 내려서 사용하고 싶으면 화살표 함수를 사용하고, 그렇지 않은 경우는 function 키워드를 사용해서 함수를 사용하면 된다.

#### 2.2.5 구조분해 할당 (디컨스트럭처링, 비구조화 할당)

자바스크립트에서는 객체나 배열에서 값을 꺼낸 뒤 이를 새로운 변수나 상수에 할당하는 일이 잦다. (웹 어플리케이션에서 http 요청을 통해 JSON 형식의 데이터를 가져온 뒤, 이를 활용해서 기능을 구현하는 상황 등...) 다음 예제를 살펴보자.

```js
const example = { a: 123, b: { c: 135, d: 146 } };
const a = example.a;
const d = example.b.d;
```

위의 경우는 어떤 값들을 포함한 객체에서 'a' 속성에 해당하는 데이터와, 'b' 속성에 해당하는 객체의 'd' 속성에 해당하는 데이터를 활용하기 위해 각각 a와 d 상수에 이를 초기화하는 상황이다. 데이터를 꺼내기 위해 example이라는 일회성 상수를 선언하고 있고, 코드의 가독성 또한 그닥 좋아보이지 않는다.

여기서 구조분해 할당 문법을 활용하면 다음과 같이 간결하게 바뀐다.

```js
const {
  a,
  b: { d },
} = { a: 123, b: { c: 135, d: 146 } };
```

배열의 경우는 어떨까?

```js
const arr = [1, 2, 3, 4, 5];
const two = arr[1];
const four = arr[3];
```

위 코드를 구조분해 할당 문법을 활용하면..

```js
const [, two, , four] = [1, 2, 3, 4, 5];
```

이렇게 쓸 수 있는 것이다. 훨씬 간결하다.

단, 배열 구조분해 할당의 경우에는 인덱스의 위치와 변수 또는 상수의 위치가 동일해야하는 제약 조건이 있으므로, arr[48], arr[99].. 이런 경우에는 사용을 자제하는 것이 좋겠다.

한 가지 주의점이 있는데, 다음 예제를 살펴보자.

```js
const candyMachine = {
  status: {
    name: "node",
    count: 5,
  },
  getCandy() {
    this.status.count--;
    return this.status.count;
  },
};
const {
  getCandy,
  status: { count },
} = candyMachine;
```

candyMachine 객체는 getCandy() 함수를 멤버로 갖고 있기 때문에, 이 함수 역시 구조분해 할당을 활용해서 꺼내올 수 있다.

그러나 꺼내온 getCandy를 실행해보면 undefined가 출력되는 것을 볼 수 있는데, 이는 getCandy의 내부에서 this를 사용하고 있기 때문이다.

this는 호출 시에 그 값이 결정되므로 위 예제에서 getCandy()의 this는 global을 가리킬 것이며, candyMachine.getCandy()의 this는 candyMachine을 가리킬 것이다.

따라서 this를 사용하고 있는 함수를 구조분해 할당으로 꺼내오는 것은 지양하는게 좋다.

#### 2.2.6 클래스

Class는 ES6에 등장한 문법이고 기존에 존재하던 Prototype 문법을 간결하게 사용할 수 있도록 하는 편의성을 제공한다. constructor() 메서드, extends 키워드를 통해 코드를 그룹화할 수 있다.

- 기존 프로토타입 문법 기반의 코드 그룹화

```js
var Human = function (type) {
  this.type = type || "human";
};

Human.isHuman = function (human) {
  return human instanceof Human;
};

Human.prototype.breathe = function () {
  alert("h-a-a-a-m");
};

var Zero = function (type, firstName, lastName) {
  Human.apply(this, arguments);
  this.firstName = firstName;
  this.lastName = lastName;
};

Zero.prototype = Object.create(Human.prototype);
Zero.prototype.constructor = Zero; // 상속
Zero.prototype.sayName = function () {
  alert(this.firstName + " " + this.lastName);
};
var oldZero = new Zero("human", "Zero", "Cho");
Human.isHuman(oldZero); // true
```

- 클래스 문법 기반의 코드 그룹화

```js
class Zero extends Human {
  constructor(type, firstName, lastName) {
    super(type);
    this.firstName = firstName;
    this.lastName = lastName;
  }

  sayName() {
    super.breate();
    alert(`${this.firstName} ${this.lastName}`);
  }
}

const newZero = new Zero("human", "Zero", "Cho");
```

기존 문법 대비 특정 인스턴스에 관련된 코드가 한 눈에 봐도 모여있어 인스턴스 내부 구조를 파악하기 쉽고 직관적임을 알 수 있다.

#### 2.2.7 Promise

프로미스는 비동기 작업에 대해 유용하게 활용할 수 있는 객체이다. 아래 코드는 프로미스를 만들고 활용하는 가장 기본적이고 널리 알려진 형태의 코드다.

```js
const promise = new Promise((resolve, reject) => {
  if (condition) {
    resolve("성공");
  } else {
    reject("실패");
  }
});

// 다른 작업

promise
  .then((result) => {
    // resolve(성공)된 경우
    console.log(result);
  })
  .catch((error) => {
    // reject(실패)된 경우
    console.err(error);
  })
  .finally(() => {
    console.log("Promise Done."); // 무조건 실행
  });
```

어떤 비동기 작업을 프로미스를 통해 수행한다고 할 때, 프로미스는 해당 작업의 결과가 성공 / 실패인 경우에 호출할 resolve와 reject라는 함수 인자를 전달 받는다.

작업이 완료된 시점에 resolve 또는 reject가 호출되면 해당 프로미스의 인스턴스에 대해 .then()과 .catch(), .finally()라는 후속 메서드를 사용할 수 있는데, 각 메서드의 역할은 다음과 같다.

- .then(): resolve()가 호출된 경우, 해당 resolve의 반환값을 인자로 받아 지정한 기능을 실행.
- .catch(): reject()가 호출된 경우, 해당 reject의 반환값을 인자로 받아 지정한 기능을 실행.
- .finally(): resolve()와 reject()의 호출 유무와 상관없이 무조건 실행.

![img](https://i.imgur.com/FDzn5s0.png)

프로미스는 기존에 "콜백 헬"이라 불리던 지저분한 자바스크립트 코드의 해결책으로 제시되었는데, 콜백 기반의 비동기 작업 처리 과정에서 에러를 잘 잡아내지 못하는 문제도 해결했다.

```js
try {
  setTimeout(() => {
    throw new Error("Error!");
  }, 1000);
} catch (e) {
  console.error("Error Catched!", e);
} // 에러를 감지하지 못한다!
```

위 코드의 try 문에서 setTimeout() 함수는 호출 스택에서 바로 처리되지 않고, Web API 쪽으로 넘어간 뒤 pop되기 때문에, catch 문의 내용은 에러를 감지할 수 없는 것이다.

하지만 프로미스의 후속 메서드 catch()는 이러한 에러를 잡아내는 데 문제가 없다.

```js
promise
  .then((result) => {
    // resolve(성공)된 경우
    console.log(result);
  })
  .catch((error) => {
    // reject(실패)된 경우
    console.err(error);
  })
  .finally(() => {
    console.log("Promise Done."); // 무조건 실행
  });
```

위에 있는 코드를 가져왔는데, 여기서 후속 메서드를 줄줄이 이어서 쓸 수 있는 이유는 후속 메서드의 반환값이 모두 프로미스이기 때문이다. 이걸 프로미스 체이닝이라고 부른다. catch()의 경우 유용한 것은 만약 then() 체이닝을 통해 여러 작업들을 줄줄이 실행하는 상황일 경우, 어느 단계에서 에러가 나더라도 이를 잡아낼 수 있다.

아래 코드를 보자.

```js
promise
  .then((res1) => {
    const res2 = res1 + 1;
    console.log("Task 1 Finished");
    return res2;
  })
  .then((res2) => {
    const res3 = res2 + 1;
    console.log("Task 2 Finished");
    return res3;
  })
  .then((res3) => {
    const res4 = res3 + 1;
    console.log("Task 3 Finished");
    return res4;
  })
  .catch((err) => {
    const someErr = new Error(err);
    return someErr;
  });
```

이런 상황에서 catch()는 Task 1, 2, 3 어느 단계에서 발생한 에러도 잡아낼 수 있다. 굳이 각 then()의 후속 메서드로 catch()를 일일이 달아줄 필요가 없는 것이다.

그리고 프로미스의 장점은 처음 소개한 코드에서도 확인할 수 있듯 "내가 원할 때" 프로미스가 갖고 있는 비동기 작업의 결과를 활용할 수 있다는 것이다. 당장 활용해도 괜찮고, 중간에 다른 작업을 끼워 넣어서 비동기 작업에 대한 코드를 "분리"해도 괜찮다.

프로미스는 다수의 프로미스를 활용한 작업에서 유용하게 사용할 수 있는 세 가지 후속 메서드를 추가로 제공한다.

.all(), .race(), .allSettled()이다.

- Promise.all() : 다수의 Promise를 요소로 갖는 배열 등의 이터러블을 인자로 받고, 모든 Promise가 fulfilled된 결과값을 담은 이터러블을 반환한다.
- Promise.race(): 다수의 Promise를 요소로 갖는 배열 등의 이터러블을 인자로 받고, 가장 먼저 fulfilled된 Promise의 처리 결과를 반환한다.

- Promise.allSettled(): 다수의 Promise를 요소로 갖는 배열 등의 이터러블을 인자로 받고, settled된 모든 Promise의 처리 결과를 반환한다.

여기서 all과 race는 ES6에서 소개되었고, 이후 allSettled가 all과 race의 단점을 보완하면서 도입되었다. (ES2020)

all과 race의 단점은 다수의 프로미스 중 단 하나의 프로미스에서 reject되는 경우에도 전부 catch()로 실행 흐름이 옮겨간다는 것이다.

다음과 같이 6개의 세션에서 돈을 보내는 상황을 가정할 수 있다.

```js
const p1 = fetch("/sendMoney/user1", { method: "POST" });
const p2 = fetch("/sendMoney/user2", { method: "POST" });
const p3 = fetch("/sendMoney/user3", { method: "POST" });
const p4 = fetch("/sendMoney/user4", { method: "POST" });
const p5 = fetch("/sendMoney/user5", { method: "POST" });
const p6 = fetch("/sendMoney/user6", { method: "POST" });

Promise.all([p1, p2, p3, p4, p5, p6])
  .then((res) => {})
  .catch((err) => {}); // 하나라도 실패 시 모든 프로미스 다시 실행

Promise.allSettled([p1, p2, p3, p4, p5, p6])
  .then((res) => {
    // 송금에 실패한 프로미스만 다시 실행
  })
  .catch((err) => {});
```

.all()을 사용하면 6개의 프로미스 중 하나의 프로미스에서 송금이 실패하더라도 모든 프로미스의 송금이 중단되기 때문에 6개의 송금 요청을 다시 보내야하지만(자원 낭비)

.allSettled()를 활용하면 송금에 실패한 프로미스만 검출해서 해당 프로미스에 대해서만 작업을 다시 시작할 수 있는 것이다.

자, 그런데 이렇게 무적처럼 보이는 프로미스도 후속 메서드의 사용이 과하거나 하면 코드의 indent depth가 늘어나지는 않더라도(콜백 패턴의 단점이었다.), 코드의 복잡도가 증가하는 문제가 남아있다.

```js
// ... 프로미스 기반 비동기 작업
promise
  .then((res) => {
    res.a = "A";
    return res.saveState();
  })
  .then((res) => {
    res.b = res.findDataWith(res.a);
    return res.saveState();
  })
  // ... then-then-then ...
  .catch((err) => {
    console.log("Error while setting states...");
  });
```

그래서 프로미스의 코드 복잡도를 개선하기 위해 ES8(ES2017)에서 async 함수와 await이 소개되었다.

#### 2.2.8 async / await

```js
async function settingStates(p) {
  const res = await p;
  res.a = "A";
  res = await res.saveState();
  res.b = await res.findDataWith(res.a);
  res = await res.saveState();
}
```

async 함수는 프로미스를 반환하고, await은 promise.then()을 완벽히 대체한다.

또한 async 함수 내부에서 try-catch문을 활용하면 promise.catch()의 기능 또한 대체할 수 있다.

```js
async function settingStates(p) {
  try {
    const res = await p;
    res.a = "A";
    res = await res.saveState();
    res.b = await res.findDataWith(res.a);
    res = await res.saveState();
  } catch (e) {
    console.log("Error while setting states...");
  }
}
```

async / await의 의의는 비동기 코드를 '동기적으로' 보이도록 한 것에 있다. 프로미스만 하더라도 데이터의 흐름은 왼쪽에서 오른쪽이지만, await의 경우는 해당 프로미스의 결과값을 변수에 저장한다면 기존의 동기 코드들이 그래왔듯 오른쪽에서 왼쪽으로 데이터가 흐른다.

```js
const promise = Promise.resolve("Success!");
const res = await promise;
console.log(res); // Success!
```

그리고 ES2022에서 비동기 작업에 더 큰 편의성을 가져다 준 Top-level await 문법이 지원되면서, 보다 직관적으로 비동기 작업을 처리할 수 있게 되었다.

프로미스에서 여러 비동기 작업을 편리하게 처리할 수 있도록 하는 all, race, allSettled와 같은 메소드를 지원하는 것과 비슷하게, async / await에서도 다수의 비동기 작업 처리에 관한 문법이 있다.

```js
const promise1 = Promise.resolve("1 Success!");
const promise2 = Promise.resolve("2 Success!");
const multiPromise = [promise1, promise2](async () => {
  for await (p of multiPromise) {
    console.log(p);
  }
})();
// "1 Success!"
// "2 Success!"
```

바로 for-await-of 문법으로, ES2019에서 소개되었고, Node 버전 10부터 지원한다.

#### 2.2.9 Map / Set 객체

Map과 Set 객체는 ES6에서 도입된 새로운 자료구조로, Map은 기존의 '객체'와 유사하고, Set은 '배열'과 비슷하다고 할 수 있다.

두 자료구조가 도입된 이유는 자바스크립트의 너무나도 높은 자유도 때문이라고 한다. 객체를 객체처럼 활용하지 않거나, 배열을 배열처럼 활용하지 않거나..? 어쨌든 이런 점 때문에 타인의 코드를 해석하는 일이 너무 힘들어지자 용도를 확실히 할 수 있는 자료구조가 도입되었다고 생각하면 될 것 같다.

일단 Map부터 살펴보자. Map은 다음과 같은 구조로 이루어져있다.

```js
const m = new Map();
m.set('a', 'b'); // set() 메소드로 '키', '값' 형태로 데이터 추가
m.get('a'); // b
m.set(3, 'c'); // 문자열이 아닌 값도 키로 활용 가능
const d = {};
m.set(d, 'e'); // 객체도 키로 활용 가능

console.log(m.size); // size로 속성 개수 조회

for (const [k, v] of m) { // for-of 반복문에 활용도 가능하고
  console.log(k, v);
}

m.forEach((v, k)) => {
  console.log(k, v) // forEach 반복문에도 활용 가능
}
```

기본적으로는 set()으로 키와 값 형태를 넘겨주면 데이터를 저장하고, get()으로 키를 넘겨주면 해당하는 값을 데이터로 가져온다. 3과 같은 숫자형이나 `{ 'name': 'John', 'age': 23 }`와 같은 객체도 키로서 활용할 수 있다는 점이 조금 특이하다.
단, 객체를 키로서 활용할 때는 set() 메서드에 인자로 그대로 전달하는 것이 아니라, 특정 변수나 상수에 할당해놓고 활용해야 한다.

추가로 활용할 수 있는 메서드는 has(), delete(), clear()가 있다.

이름에서 직관적으로 알 수 있듯 각 메서드의 기능은 다음과 같다.

- has(): 키를 인자로 넘기면 해당 키에 등록된 값의 존재 여부를 반환한다.
- delete(): 키를 인자로 넘기면 해당 키-값 쌍을 Map에서 삭제한다.
- clear(): 호출하면 Map을 전부 지워준다.

정리하면, Map은 기존의 객체에 비해 속성들 간 순서를 보장하고, 이들을 활용할 수 있는 유용한 메소드들을 지원하며, 반복문을 편하게 사용할 수 있고, 문자열이나 Symbol이 아닌 다른 값을 키로서 활용할 수 있는 좋은 자료구조라고 할 수 있다.

다음은 Set을 살펴보자. 앞서 Set은 배열과 비슷하다고 소개한 바가 있다.

```js
const s = new Set();
s.add(false);
s.add(1);
s.add("1");
s.add(1); // ignored
s.add(2);

console.log(s.size); // 4
console.log(s.has(1)); // true

for (const item of s) {
  console.log(item); // false, 1, '1', 2
}

s.forEach((item) => {
  console.log(item); // 결과는 위와 동일
});

s.delete(2); // 인자로 넘긴 item이 존재하면 삭제
s.clear(); // Set 자료구조 비우기
```

그렇지만 배열과 근본적으로 다른 속성이 하나 있는데, 바로 "요소들 간 중복을 허용하지 않는다"는 점이다. 따라서 Set 자료구조는 집합과 가장 가깝다고 생각하면 된다.

이러한 특성 덕분에 기존 data에서 "중복된 요소를 제거할 때" 이 Set을 활용하면 된다.

Set 자료구조에서도 요소를 추가하는 add(), 요소의 개수 정보를 저장하는 size 속성, 요소를 제거하는 delete(), 자료구조 전체를 비우는 clear()와 같이 유용한 메서드와 속성이 있고, Map과 동일하게 for-of, forEach() 반복문을 지원한다.

이 Map과 Set과 관련이 높은 WeakMap과 WeakSet이라는 자료구조도 있다.

여기서 'Weak'이라는 접두어는 단어 그대로의 '약하다'는 의미가 아닌, '가비지 컬렉터에 의해 정리가 잘 되는'이라는 뜻이다. 뭐 그렇게 생각한다면 '메모리와의 결합도가 상대적으로 **약한**'으로 생각할 수도 있을 것 같다.

WeakMap에 대한 예제를 한번 살펴보자.

```js
const m = new Map();
let obj = {};

m.set(obj, "123");
```

```js
const wm = new WeakMap();
let obj = {};

wm.set(obj, "123");
```

이렇게 WeakMap과 Map 인스턴스의 사례에 대해 각각 obj를 키로, '123'을 값으로 갖는 데이터를 하나 등록한다고 가정해보자.

```js
obj = null;
```

여기서 `obj`에 `null`을 할당하면 Map의 경우는 `m.set()`에서 obj를 키로 활용하고 있다는 코드 때문에 obj는 메모리에서 해제되지 않지만, WeakMap의 경우에는 GC에 의해 메모리에서 해제된다는 것이 둘의 차이점이다.

조금 더 실용적인 예제를 살펴보자.

```js
let user = { name: "cheshier", name: "25" };
```

이런 정보를 포함하는 객체에 대해 다음과 같은 속성을 하나 추가한다고 가정해보자.

```js
user.married = false;
```

성공적으로 **'married': false** 속성이 추가되었을 것이다.

하지만 이런 방식은 원본의 객체 데이터를 변경하기 때문에 이 객체를 참조하고 있는 다른 코드들이 영향을 받을 수 있다. 그렇게 되면 잠재적인 에러가 늘어날 확률이 높아지기 때문에, 실무에서는 이미 많은 코드들이 참조하고 있는 객체나 배열 데이터의 원본을 함부로 변경하는 코드나 메서드의 활용을 지양하고 있다고 한다.

그럼 user 객체의 원본을 변경하지 않으면서 어떻게 married 속성을 추가할 수 있을까? 원본을 복사한 사본 객체를 만들어서 활용할 수도 있겠지만, 여기서 WeakMap을 활용하는 방법을 알아보자.

```js
const wm = new WeakMap();
wm.set(user, { married: false });
```

그럼 나중에 `user = null;` 등의 코드를 통해 user를 메모리에서 해제하고 싶은 상황이라면, WeakMap의 특성에 의해 이를 복사했던 사본 데이터들도 자동으로 메모리에서 해제시킬 수 있는 것이다.

#### 2.2.10 널 병합 / 옵셔널 체이닝

널 병합 연산자(`??`)와 옵셔널 체이닝 연산자(`?`)는 ES2020에서 도입되었다.

널 병합 연산자는 주로 `||` 연산자로 처리하던 falsy 값(0, '', false, NaN, null, undefined) 중 null과 undefined만 따로 구분한다.

```js
const a = 0;
const b = a || 3;
console.log(b); // 3

const c = 0;
const d = c ?? 3; // ?? 연산자는 null과 undefined일 때만 뒤로 넘어감
console.log(d); // 0

const e = null;
const f = e ?? 3;
console.log(f); // 3

const g = undefined;
const h = g ?? 3;
console.log(h); // 3
```

옵셔널 체이닝 연산자는 null이나 undefined의 속성을 조회하는 경우 에러가 발생하는 것을 막아준다. (사실상 천사...)

```js
const a = {};
console.log(a.b); // a가 객체이므로 정상 실행 (값은 없더라도)

const c = null;
try {
  console.log(c.d);
} catch (e) {
  console.err(e); // 타입 에러: null의 속성을 읽을 수는 없다 바보야!
}

console.log(c?.d); // 정상 실행 : undefined
```

즉, 어떤 값의 유효성이 의심될 때 사용하면 된다.

주의할 점은, 만약 c가 배열 타입이고 어떤 인덱스의 요소에 대해 유효성이 의심되는 상황이어서 이 옵셔널 체이닝 연산자를 사용한다고 하면

```js
c?[0] // X
c?.[0] // O
```

위와 같이 사용해야한다.

이 두 연산자를 잘 활용하면 if문의 남발을 피할 수 있으니 잘 알아두자.
