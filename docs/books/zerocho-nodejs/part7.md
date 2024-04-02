## 제로초의 Node.js 교과서 섹션 7 요약

### 8.1 NoSQL vs SQL

이번 장에서는 조금 다른 유형의 SQL에 대해 알아보자. SQL의 반대 진영에 있는 데이터베이스 유형으로서, NoSQL(Not only SQL)이 있다. MongoDB가 이 진영의 대표주자이고, 특징 중 하나는 자바스크립트 문법을 사용한다는 것이다. 자바스크립트는 어렵지만 진짜 잘 알아두면 모든 곳에서 전부 쓰이는 것 같다. (JavaScript is Everywhere?)

앞서 알아본 SQL과의 대표적인 특징을 비교해보자. 우선 SQL은 다음과 같은 특징이 있었다.

- 규칙에 맞는 데이터 입력
- 테이블 간 JOIN 지원
- 안정성, 일관성
- 테이블, 로우, 컬럼 등의 용어 사용

NoSQL은 어떨까?

- 자유로운 데이터 입력
- 컬렉션 간 JOIN 미지원
- 확장성, 가용성
- 컬렉션, 다큐먼트, 필드 등의 용어 사용

충격적이게도 NoSQL은 고정된 '테이블'이 없다. 그래서 문법만 맞는다면 전혀 새로운 타입의 데이터가 추가돼도 저장한다. 테이블이 일종의 계란판이라면, 컬렉션은 꾸러미라고 생각하면 될 것 같다. 테이블 간 관계를 설정할 수 없어서 동시에 여러 쿼리를 실행했을 때 예상치 못한 결과를 초래할 수도 있지만, 그러한 단점에도 확장성과 가용성 때문에 NoSQL은 사용할 가치가 충분하다고 할 수 있다. 데이터의 일관성을 보장하지 않는 대신 데이터 삽입 속도가 비교적 빠르고, 여러 서버에 데이터를 쉽게 분산할 수 있다.
그래서 SQL과 NoSQL을 겸해서 사용하는 기업들도 많다고 한다.

### 8.2 몽고디비 설치하기

맥에서 몽고디비의 설치 역시 Homebrew를 통해 쉽게 수행할 수 있다.

```bash
brew tap mongodb/brew
brew install mongodb-community
brew install mongosh
```

맥의 경우 `/usr/local/var/mongodb`에 데이터가 저장된다고 한다.
설치가 끝나면 실행해보자.

```bash
brew services start mongodb-community
mongosh
```

그러면 이제 mysql 프롬프트와 비슷하게 `test>`라는 프롬프트를 볼 수 있다.
관리자 계정을 추가해보자. 이름과 비밀번호는 자유롭게 설정하면 된다.

```js
db.createUser({ user: "이름", pwd: "비밀번호", roles: ["root"] });
```

그러면 `{ ok: 1 }`이라는 응답이 날아온다.

이제 `Ctrl+C`를 눌러서 프롬프트를 종료하고, 몽고디비를 종료해주자.

```bash
brew services stop mongodb-community
```

그리고 Silicon Mac 기준 아래 경로의 파일을 열어주자.

```bash
vim /opt/homebrew/etc/mongod.conf
```

Intel Mac은 아래 경로의 파일을 열면 된다.

```bash
vim /usr/local/etc/mongod.conf
```

해당 파일의 최하단에 아래 두 줄의 내용을 추가해주자.

```plain
...
security:
  authorization: enabled
```

그리고 다시 몽고디비 서비스를 실행하고, 프롬프트에 접근할 때는 아래와 같은 명령어를 통해 접속하면 된다.

```bash
mongosh admin -u [이름] -p [비밀번호]
```

### 8.3 컴퍼스 설치하기

몽고디비의 GUI 관리도구로서 컴퍼스(Compass)를 사용할 수 있다. MySQL과 비슷하게 역시 몽고디비 공식 사이트에서 다운로드 받을 수 있고, 무료다!

하지만 맥에서는 Homebrew를 통해 설치하는게 더 간단하다고 한다.

```bash
brew install --cask mongodb-compass
```

MySQL Workbench와 비슷하게 이 프로그램 내에서 DB를 생성하고, 컬렉션과 필드를 정의할 수 있다.

### 8.4 데이터베이스 및 컬렉션 생성하기

이제 데이터베이스와 컬렉션을 직접 만들어보자. 몽고디비에서 데이터베이스를 만드는 명령어는 `use [데이터베이스명]`이다.
그리고 현재 DB 목록을 표시하는 명령어는 `show dbs`이다.

뭔가 이상한 점은 DB만 만들면 실제 mongosh 상에서 DB 목록을 확인 했을때 목록에 없다는 것인데, 이건 몽고디비에서 DB는 뭔가 데이터를 하나 포함하고 있어야 DB 검색이 되기 때문이라고 한다. 바로 컬렉션을 만들어주자.

컬렉션을 만드는 명령어는 `db.createCollection('컬렉션이름')`이다.
mysql을 공부할 때와 같이 `users`와 `comments`를 만들어주고, `show dbs`로 확인해보면 이제는 db 목록에 잘 잡히는 것을 확인할 수 있다.

### 8.5 CRUD 작업하기

#### 8.5.1 Create(생성)

몽고디비는 NoSQL 데이터베이스이므로 따로 테이블을 정의하지 않아도 바로 데이터를 삽입할 수 있는 자유로움이 있다.
몽고디비에서 허용하는 자료형은 어떤 것들이 있을까? 일단 몽고디비는 JS 문법을 따르므로 JS의 자료형을 그대로 허용하며, 몇 가지 추가적인 자료형 또한 허용한다.

- Date
- RegExp
- Binary Data (자주 사용)
- ObjectId (자주 사용)
- Int
- Long
- Decimal
- Timestamp (자주 사용)
- JavaScript
  그러나 Undefined와 Symbol은 JS의 객체이지만 몽고디비에서 자료형으로 사용되지 않는다. 그리고 여기서 ObjectId는 MySQL에서 Primary Key와 역할이 비슷하다고 한다.

다큐먼트를 하나 생성해보자. 다큐먼트는 `db.컬렉션명.insertOne(다큐먼트)` 명령어로 생성할 수 있다.

```js
db.users.insertOne({
  name: "rati",
  age: 26,
  married: false,
  comment: "안녕하세요. 지금 몽고디비를 공부 중입니다.",
  createdAt: new Date(),
});
```

그러면 셸의 응답으로 아래와 같은 로그가 찍힌다.

```bash
{
  acknowledged: true,
  insertedId: ObjectId('65a470aea855dd04b769adc7')
}
```

앞서 이 ObjectId는 MySQL의 Primary Key와 비슷한 역할을 한다고 서술했다. comments 다큐먼트를 생성하며 그 이유를 알아보자.
일단 rati의 댓글을 생성하기 위해 로그에 찍힌 ObjectId를 잠시 복사해두자.
임의로 찾는 명령어도 물론 있다.

```js
db.users.find({ name: "rati" }, { _id: 1 });
```

그리고 comments 다큐먼트는 아래와 같이 생성할 수 있다.

```js
db.comments.insertOne({
  commenter: ObjectId("65a470aea855dd04b769adc7"),
  comment: "안녕하세요. rati의 댓글입니다.",
  createdAt: new Date(),
});
```

#### 8.5.2 Read(조회)

방금 만든 이 다큐먼트들을 조회하는 명령어는 아래와 같다.

```js
db.컬렉션명.find({});
```

특정 필드만 조회하고 싶으면, 예를 들어 users 컬렉션의 name과 married 필드만 조회하는 경우, 이렇게 작성하면 된다.

```js
db.users.find({}, { _id: 0, name: 1, married: 1 });
```

0은 false를, 1은 true를 의미한다. 그래서 find 메서드의 두번째 인자로 들어간 객체의 의미는 `id는 가져오지말고, name과 married만 가져와라`가 된다.

특정 조건에 해당하는 필드만 조회하고 싶으면, 첫번째 인자의 객체에 정의해주면 된다.
일단 실습을 위해 users 컬렉션에 다큐먼트를 하나 더 추가해보자.

```js
db.users.insertOne({
  name: "cheshier",
  age: 30,
  married: true,
  comment: "안녕하세요. 계란 한판은 짜릿하군요.",
  createdAt: new Date(),
});
```

```bash
nodejs> db.users.find({});
[
  {
    _id: ObjectId('65a470aea855dd04b769adc7'),
    name: 'rati',
    age: 26,
    married: false,
    comment: '안녕하세요. 지금 몽고디비를 공부 중입니다.',
    createdAt: ISODate('2024-01-14T23:39:26.297Z')
  },
  {
    _id: ObjectId('65a479d6a855dd04b769adc9'),
    name: 'cheshier',
    age: 30,
    married: true,
    comment: '안녕하세요. 계란 한판은 짜릿하군요.',
    createdAt: ISODate('2024-01-15T00:18:30.887Z')
  }
]
```

나이 조건과 married를 활용해서 cheshier의 다큐먼트를 조회하는데, 이름과 나이 필드만 조회해보자.

```js
db.users.find({ age: { $gt: 27 }, married: true }, { _id: 0, name: 1, age: 1 });
```

```bash
nodejs> db.users.find({ age: { $gt: 27 }, married: true }, { _id: 0, name: 1, age: 1 });
[ { name: 'cheshier', age: 30 } ]
```

시퀄라이즈의 쿼리와 비슷한 $gt(greater than)라는 속성을 사용했다. 이는 몽고디비가 자바스크립트 객체를 통해 쿼리를 생성하기 때문에 사용하는 연산자이다.
자주 쓰이는 연산자는 아래와 같은 것들이 있다. 시퀄라이즈와 거의 동일하다.

- $gt
- $gte
- $lt
- $lte
- $ne
- $or
- $in
  $or 연산자는 두 조건을 요소로 가진 배열을 값으로 갖고있는 식으로 사용할 수 있다.
  나이가 27보다 적거나 결혼한 사용자를 검색한다고 했을 때, 아래와 같이 작성할 수 있다.

```js
db.users.find(
  { $or: [{ age: { $lt: 27 } }, { married: true }] },
  { _id: 0, name: 1, age: 1 }
);
```

```bash
nodejs> db.users.find( { $or: [{ age: { $lt: 27 } }, { married: true }] }, { _id: 0, name: 1, age: 1 });
[ { name: 'rati', age: 26 }, { name: 'cheshier', age: 30 } ]
```

sort 메서드를 사용한 정렬도 가능하다. -1은 내림차순, 1은 오름차순이다.

```js
db.users.find({}, { _id: 0, name: 1, age: 1 }).sort({ age: -1 });
```

limit를 활용한 다큐먼트 개수 제한과,

```js
db.users.find({}, { _id: 0, name: 1, age: 1 }).sort({ age: -1 }).limit(1);
```

skip 메서드로 건너뛸 다큐먼트 개수를 제공할 수도 있다.

```js
db.users
  .find({}, { _id: 0, name: 1, age: 1 })
  .sort({ age: -1 })
  .limit(1)
  .skip(1);
```

#### 8.5.3 Update(수정)

수정도 직관적인 메서드를 통해 수행할 수 있다.

```js
db.users.updateOne(
  { name: "cheshier" },
  { $set: { comment: "안녕하세요~ 유부남 라이프도 짜릿하네요!" } }
);
```

`updateOne()`의 첫번째 객체는 수정할 다큐먼트를 지정하는 객체이고, 두번째 객체는 수정할 내용을 입력한다.
그리고 두번째 객체에서 사용하는 $set이라는 연산자는 수정할 필드와 그 내용을 입력한다.
수정에 성공하면 아래와 같은 로그가 찍힌다.

```bash
{
  acknowledged: true,
  insertedId: null,
  matchedCount: 1,
  modifiedCount: 1,
  upsertedCount: 0
}
```

#### 8.5.4 Delete(삭제)

삭제는 더 간단하다.

```js
db.users.deleteOne({ name: "cheshier" });
```

삭제할 대상만 지정해주면 되고, 성공시 아래와 같은 로그가 찍힌다.

```bash
{ acknowledged: true, deletedCount: 1 }
```

### 8.6 몽구스 사용하기

MySQL의 진영의 시퀄라이즈에 해당하는 것이 몽구스(Mongoose)이다.
하지만 시퀄라이즈가 ORM(Object Relational Mapping)인데 반해 몽구스는 몽고디비가 관계형 DB가 아닌 점 때문에 별도로 ODM(Object Document Mapping)이라는 분류로 되어있다.

앞서 시퀄라이즈는 JS로 SQL을 보다 쉽게 다룰 수 있게하는 효용이 있어 사용하는 목적도 있다고 서술했었는데, 이미 JS 기반의 DB인 몽고디비에 몽구스를 왜 써야하는 것일까?
그 이유는 몽고디비에 기본적으로 지원되지 않아 불편했던 점들을 몽구스가 보완해주기 때문이다.

몽구스를 사용하면 컬렉션을 테이블처럼 쓸 수 있도록 스키마(Schema)를 정의할 수 있고, JOIN 연산처럼 사용할 수 있는 populate라는 기능도 지원해준다.
뿐만 아니라 쿼리를 쉽게 완성할 수 있는 쿼리 빌더, 각종 몽고디비에 데이터를 할당하기 전에 일차적인 필터링 기능도 수행한다.

### 8.7 몽구스 스키마 사용하기

몽고디비에서는 NoSQL의 특성상 필드가 정의되어 있지 않아도 데이터를 추가할 수 있지만, 몽구스를 사용한다면 스키마를 사용해서 필드를 정의해야한다. 아래는 User 스키마의 예시이다.

```js
const mongoose = require('mongoose');

const { Schema } = mongoose;
const userSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  age: {
    type: Number,
    required: true,
  },
  married: {
    type: Boolean,
    required: true,
  },
  comment: String, // required: false 생략
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('User', userSchema);
```

Sequelize와 비슷하게 `_id`의 경우는 자동으로 ObjectId를 넣어준다.

그리고 몽구스에서 조인은 아니지만 조인과 비슷하게 사용할 수 있는 기능으로, `ref`가 있다.

```js
const mongoose = require('mongoose');

const { Schema } = mongoose;
const { Types: { ObjectId } } = Schema;
const commentSchema = new Schema({
  commenter: {
    type: ObjectId,
    required: true,
    ref: 'User',
  },
  comment: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Comment', commentSchema);
```

commenter 필드를 보면 User 스키마를 '참조'하고 있는데, 이게 SQL의 조인과 비슷하게 작동한다.

이 기능을 'populate'라고 하며, 해당 필드의 데이터는 ObjectId에 해당하는 실제 객체로 치환된다. 단, 자바스크립트로 실행되기 때문에 속도가 느리며, 다른 스키마를 참조해서 관계를 맺는다는 것 자체가 몽고디비의 본 사용 철학과는 약간 다른 점이 있어서 이 기능을 사용하는 것에 이견이 분분하다고 한다.

그렇지만 실제 대용량 데이터를 다룬다고 해도 정형 데이터로서 다뤄지는 빈도가 더 높고, 스키마 간 관계를 설정해서 관리하는게 더 편리하다고 느껴서 이 방법이 더 대세가 되지 않을까 생각한다.
