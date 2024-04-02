## 제로초의 Node.js 교과서 섹션 6 요약

### 7.1 데이터베이스란?

데이터베이스, 보통 디비(DB)라고 줄여 부르는 이 친구는 서버 단에서 영구히 저장할 정보들을 보관하는 공간이다.
얘를 관리하는 친구가 DBMS. 보통 관리하는 데이터가 정형인지 비정형인지에 따라 RDBMS, NoSQL로 나뉘고, MySQL(MariaDB) 또는 PostgreSQL이 관계형 DB의 대표주자 격. 비관계형 DB 군에서는 MongoDB가 대표적이다.

### 7.2 MySQL 설치하기

맥은 맘 편하게 Homebrew로 설치하자.

```bash
brew install mysql
brew services start mysql
mysql_secure_installation // 까먹지 말자
```

마지막 `mysql_secure_installation`은 MySQL의 root 비밀번호를 설정하는 중요한 단계이다. 빼먹지 말자.

### 7.3 워크벤치 설치하기

MySQL Workbench라는 프로그램이 있는데, DB를 CLI에서만 다루면 참 불편하기 때문에, 눈과 마음이 편한 GUI에서 다루도록 도와주는 프로그램이다.
MySQL 공식 사이트에 가면 무료로 설치해서 사용할 수 있다. (공짜 좋아)

맥에서는 역시 Homebrew로 설치할 수 있다.

```bash
brew install --cask mysqlworkbench
```

워크벤치에서는 커넥션을 설정해줘야한다. (`http://localhost:3306`으로 DB에 접속할 수 있도록하는 설정)

유료로 쓸만한 툴에는 Jetbrain에서 만든 DataGrip이라는 툴도 있는데, 지인이 자동완성 지린다고 추천해서 사용해보려한다.

### 7.4 데이터베이스 및 테이블 생성

일단 cli 환경에서 mysql 콘솔에 진입하려면, 아래와 같은 명령어를 입력하면 된다.

```bash
mysql -h localhost -u root -p
```

그리고 아까 설정한 root 패스워드를 입력하면 접속할 수 있다.
그런데 `-h localhost`는 기본값이므로, 생략 해줄 수 있다.

들어가서 `nodejs`라는 데이터베이스를 만들어보자.
데이터베이스는 하나의 '서비스'를 위한 정보의 집합 단위라고 생각하면 된다.

```sql
create database nodejs;
```

그리고 `show databases;`를 입력하면 방금 만든 nodejs 데이터베이스를 확인할 수 있을 것이다.
그리고 스키마를 만드는 명령어도 있는데, MySQL에서 데이터베이스와 스키마는 같은 개념이므로, nodejs라는 데이터베이스를 만들 때 `database` 대신 `schema`를 넣어도 된다.

nodejs 데이터베이스를 삭제하고, 한글과 이모티콘을 사용할 수 있게 다시 만들어보자.

```sql
drop database nodejs;
```

위 명령을 통해 데이터베이스를 삭제할 수 있다.

그리고 다시 만들어보자.

```sql
create schema `nodejs` default character set utf8mb4 default collate utf8mb4_general_ci;
```

`character set utf8mb4`가 한글과 이모티콘 관련 설정, `collate utf8mb4_general_ci`는 이 charset을 어떻게 정렬할 것인지 설정한다.

추가로 데이터베이스 이름에 따옴표가 아닌 백틱 기호를 사용하는게 좋다.

테이블도 만들어보자.

```sql
create table nodejs.users (
    id int not null auto_increment,
    name varchar(20) not null,
    age int unsigned not null ,
    married tinyint not null ,
    comment text null ,
    created_at datetime not null default now(),
    primary key (id),
    unique index name_unique (name ASC ))
comment = '사용자 정보'
engine = InnoDB;
```

생소했던것만 알아보면, tinyint 자료형과 마지막 `unique index name_unique (name ASC )`인데, tinyint는 -127 ~ 127의 정수값을 할당할 수 있는 자료형이다. 그 다음은 'unique index'라는 옵션인데, 해당 값이 고유해야 하는지에 대한 옵션이다. 여기서는 name 컬럼이 할당되었고, 인덱스 이름은 name_unique, 정렬 기준은 오름차순인 것이다.

`comment`와 `engine`도 생소했는데, 각각 테이블에 대한 보충 설명과 테이블 자체에 대한 설정이라고 한다.

이 테이블을 콘솔에서 확인하는 명령은 `DESC nodejs.users`이다. (describe?)

추가로 댓글을 위한 테이블도 만들어보자.

```sql
create table nodejs.comments (
    id int not null auto_increment,
    commenter int not null ,
    comment varchar(100) not null ,
    created_at datetime not null default now(),
    primary key (id),
    index commenter_id (commenter asc),
    constraint commenter
    foreign key (commenter)
    references nodejs.users (id)
    on delete cascade
    on update cascade )
    comment = '댓글'
    engine = 'InnoDB';
```

이 테이블은 사용자가 댓글을 달기 때문에 users 테이블과 관계를 갖고 있다는 특징이 있다. (commenter)
유저가 삭제되거나 수정되면 cascade 옵션 때문에 같이 변경된다는 제약 사항을 걸었다.

### 7.5 CRUD 작업하기

Create(생성), Read(조회), Update(수정), Delete(삭제)의 앞 글자를 따서 보통 CRUD라고 한다. 각 작업에 해당하는 SQL문을 하나씩 살펴보자.

#### 7.5.1 Create(생성)

유저 데이터를 하나 만들어보자.

```sql
insert into nodejs.users (name, age, married, comment) values ('rati', 26, 0, 'Hello');
```

그리고 댓글도 하나 만들어보자.

```sql
insert into nodejs.comments (commenter, comment) values (1, '안녕하세요! Rati의 댓글입니다.');
```

이 데이터들은 `select * from 테이블명;` 문으로 조회할 수 있다.

#### 7.5.2 Read(조회)

`select * from 테이블명;`에서 \* 대신 컬럼명을 대입하면 특정 컬럼만 조회할 수 있고, from 절 뒤에 where 절을 붙이면 특정 조건에 해당하는 데이터만 조회할 수 있다.

예시)

```sql
select id, name from nodejs.users where married = 0 and age < 30;
```

where절 뿐 아니라 order by 절을 활용해 정렬할 수도 있다.

#### 7.5.3 Update(수정)

수정 명령어의 기본 뼈대는 `update 테이블명 set 컬럼명=바꿀 값 where 조건`이다.

#### 7.5.4 Delete(삭제)

삭제 명령어의 기본 뼈대는 `delete from 테이블명 where 조건`이다.

### 7.6 시퀄라이즈 사용하기

시퀄라이즈는 노드 서버에서 sql db에 접속해서 mysql 관련 작업을 쉽게 할 수 있도록 도와주는 라이브러리다. 대표적인 ORM(Object-relational Mapping) 라이브러리이며, MySQL 외 다른 DB와도 사용이 가능하다. 문법이 어느 정도 호환되므로, DB 마이그레이션 작업에 사용하기도 적합하다고 한다.

JS 코드를 MySQL 코드로 변환해주기 때문에 MySQL을 막 아주 잘 알진 못해도 SQL 관련 작업을 할 수 있게 해준다.

프로젝트 세팅을 해보자. package.json을 만들고, 아래 라이브러리들을 설치해주자.

```json
{
  "name": "section7",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "start": "nodemon app"
  },
  "keywords": [],
  "author": "",
  "license": "ISC"
}
```

```bash
npm i express morgan nunjucks sequelize sequelize-cli mysql2
npm i -D nodemon
```

그리고 sequelize init을 수행해주자.

```bash
npx sequelize init
```

그러면 config/, migrations/, models/ 3개의 디렉토리에 각각 어떤 파일들이 생성되는데, models/index.js에 이미 있는 내용을 지우고 아래 내용으로 채워주자. (Boilerplate)

```js
const Sequelize = require("sequelize");

const env = process.env.NODE_ENV || "development";
const config = require("../config/config.json")[env];
const db = {};

// Sequelize 인스턴스 생성
const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  config
);
db.sequelize = sequelize;

module.exports = db;
```

대문자로 시작하는 Sequelize는 생성자다. 그래서 인스턴스를 만들면 하나의 DB와 연결할 수 있다.

이제 익스프레스 앱에서 시퀄라이즈를 통해 MySQL과 연결해보자.

```js
const express = require("express");
const path = require("path");
const morgan = require("morgan");
const nunjucks = require("nunjucks");

const { sequelize } = require("./models");

const app = express();
app.set("port", process.env.PORT || 3001);
app.set("view engine", "html");
nunjucks.configure("views", {
  express: app,
  watch: true,
});
sequelize
  .sync({ force: false })
  .then(() => {
    console.log("데이터베이스 연결 성공");
  })
  .catch((err) => {
    console.error(err);
  });

app.use(morgan("dev"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const error = new Error(`${req.method} ${req.url} 라우터가 없습니다.`);
  error.status = 404;
  next(error);
});

app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = process.env.NODE_ENV != "production" ? err : {};
  res.status(err.status || 500);
  res.render("error");
});

app.listen(app.get("port"), () => {
  console.log(app.get("port"), "번 포트에서 대기 중");
});
```

`models/index.js`에서 sequelize를 require 해오고, `db.sequelize.sync()`를 통해 데이터베이스와 연결한다. 이때 `force` 옵션은 서버를 실행할 때마다 테이블을 재생성할지에 대한 여부를 결정하는데, false로 설정하였다. 나중에 테이블을 잘못 만들면 true로 바꾸고 서버를 재실행하면 된다.

`config/config.json` 파일은 MySQL과 연동할 때 사용할 정보들이 들어있는데, development의 정보만 우선 입력해두자.

정보를 입력하고 `npm start`로 서버를 시작하면 콘솔에 `데이터베이스 연결 성공`이라는 로그를 볼 수 있다.

그럼 이제 시퀄라이즈의 모델을 통해 테이블을 정의해보자. User와 Comment 모델을 만들어서 각각 users와 comments 테이블에 연결하면 된다.
시퀄라이즈는 기본적으로 모델 이름은 단수형, 테이블 이름은 복수형으로 사용한다.

```js
const Sequelize = require("sequelize");

class User extends Sequelize.Model {
  static initiate(sequelize) {
    User.init(
      {
        // ID 컬럼은 시퀄라이즈에서 자동 생성
        name: {
          type: Sequelize.STRING(20),
          allowNull: false,
          unique: true,
        },
        age: {
          type: Sequelize.INTEGER.UNSIGNED,
          allowNull: false,
        },
        married: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
        },
        comment: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        created_at: {
          type: Sequelize.DATE, // MySQL DATETIME과 대응
          allowNull: false,
          defaultValue: Sequelize.NOW,
        },
      },
      {
        sequelize,
        timestamps: false, // true 시 createdAt, updatedAt 생성
        underscored: false, // 컬럼명에 언더스코어 사용 여부
        modelName: "User",
        tableName: "users",
        paranoid: false, // true 시 deletedAt 생성 // soft delete
        charset: "utf8mb4",
        collate: "utf8mb4_general_ci",
      }
    );
  }

  static associate(db) {
    db.User.hasMany(db.Comment, { foreignKey: "commenter", sourceKey: "id" });
  }
}

module.exports = User;
```

뭔가 길지만 굉장히 읽기 쉽게 구조화돼있다. `init()` 내부에 컬럼에 대한 정보를 할당해주고, 처음보는 옵션들이 있지만 이해하기 그닥 어렵진 않다.

Comment 모델도 만들어보자.

```js
const Sequelize = require("sequelize");

class Comment extends Sequelize.Model {
  static initiate(sequelize) {
    Comment.init(
      {
        comment: {
          type: Sequelize.STRING(100),
          allowNull: false,
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: true,
          defaultValue: Sequelize.NOW,
        },
      },
      {
        sequelize,
        timestamps: false,
        underscored: false,
        modelName: "Comment",
        tableName: "comments",
        paranoid: false,
        charset: "utf8mb4",
        collate: "utf8mb4_general_ci",
      }
    );
  }
  static associate(db) {
    db.Comment.belongsTo(db.User, { foreignKey: "commenter", targetKey: "id" });
  }
}

module.exports = Comment;
```

Comment 모델을 작성하며 MySQL에는 있던 `commenter` 컬럼은 작성하지 않았다. 왜일까?
시퀄라이즈에선 관계를 정의해두면 컬럼을 자동으로 생성해주기 때문이다.
테이블 관계상 작성자와 댓글은 1:N 관계이다. 각 모델 정의 코드에서 아래 코드를 살펴보자

```js
// User
static associate(db) {
    db.User.hasMany(db.Comment, { foreignKey: 'commenter', sourceKey: 'id' });
  }
```

```js
// Comment
static associate(db) {
    db.Comment.belongsTo(db.User, { foreignKey: 'commenter', targetKey: 'id' });
  }
```

User 쪽은 `hasMany()`, Comment 쪽은 `belongsTo()`로 돼있다. 오우 매우 직관적이다.
User has Many Comment and Comment is belongs to User. 라는 영문장으로도 자연스럽게 떠오른다. 즉 이 코드가 두 테이블의 관계인 1:N을 정의하는 것이다.
1:1 관계에선 `hasOne()`, 다대다 관계에선 양쪽 모두에 `belongsToMany()`를 사용한다.
다대다 관계에선 특성상 새로운 모델이 생성되는데, through 옵션에 해당 모델의 이름을 작성하면 된다.

이제 만든 모델을 연결해보자.

```js
// models/index.js
const Sequelize = require("sequelize");
const User = require("./user");
const Comment = require("./comment");

const env = process.env.NODE_ENV || "development";
const config = require(__dirname + "/../config/config.json")[env];
const db = {};

// Sequelize 인스턴스 생성
const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  config
);
db.sequelize = sequelize;

db.User = User;
db.Comment = Comment;

// 각 모델의 static.initiate 메서드 호출
User.initiate(sequelize);
Comment.initiate(sequelize);

// 각 모델의 static.associate 메서드 호출
User.associate(db);
Comment.associate(db);

module.exports = db;
```

각 모델을 require해주고 `static.initiate`, `static.associate` 메서드를 호출하며 sequelize instance와 db를 인자로 넘겨주면 된다.

```bash
[nodemon] starting `node app.js`
3001 번 포트에서 대기 중
Executing (default): SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE' AND TABLE_NAME = 'users' AND TABLE_SCHEMA = 'nodejs'
Executing (default): SHOW INDEX FROM `users` FROM `nodejs`
Executing (default): SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE' AND TABLE_NAME = 'comments' AND TABLE_SCHEMA = 'nodejs'
Executing (default): SHOW INDEX FROM `comments` FROM `nodejs`
데이터베이스 연결 성공

```

여기까지 하고 서버를 실행시키면 콘솔에 위와 같은 메시지가 출력되는데, 시퀄라이즈가 실행하는 sql문이다.

이제 시퀄라이즈에서 CRUD를 하기 위한 쿼리를 어떻게 작성하는지 알아보자.
생성문부터 살펴보면, 아래와 같다.

```sql
insert into nodejs.users (name, age, married, comment) values ('rati', 26, 0, 'Hello~');
```

```js
const { User } = require("../models");
User.create({
  name: "rati",
  age: 26,
  married: false,
  comment: "Hello~",
});
```

위는 SQL문이고 아래는 시퀄라이즈 쿼리인데, 매우 쉽다. 정의한 모델을 require해와서 `create()` 메서드에 컬럼과 입력값을 작성해주면 된다.

조회문도 살펴보자.

```sql
select * from nodejs.users;
```

```js
User.findAll({});
```

```sql
select name, married from nodejs.users;
```

```js
User.findAll({
  attributes: ["name", "married"],
});
```

```sql
select name age from nodejs.users where married = 1 and age > 30;
```

```js
const { Op } = require("sequelize");
const { User } = require("../models");
User.findAll({
  attributes: ["name", "age"],
  where: {
    married: true,
    age: { [Op.gt]: 30 },
  },
});
```

limit, offset, 정렬을 위한 order 또한 사용할 수 있다.

일단 여기까지 봤을 때 시퀄라이즈 쿼리는 연산자를 sequelize 모듈의 Op라는 객체를 꺼내와서 쓴다는 것과, MySQL에 undefined 자료형이 없기 때문에 null을 대입해야한다는 특징이 있다. 그리고 모델에서 각 쿼리에 해당하는 메서드(create, findAll(one), update, destroy)는 프로미스를 반환하므로, 결과값이 필요하면 await이나 then(), catch() 등으로 받아오면 된다.

```sql
update nodejs.users set comment = '바꿀 내용' where id = 2;
```

```js
User.update({
  comment: '바꿀 내용',
}, {
  where: { id: 2 };
});
```

```sql
delete from nodejs.users where id = 2;
```

```js
User.destroy({
  where: { id: 2 };
});
```

수정과 삭제문은 where 옵션으로 꼭 변화를 일으킬 데이터를 구체적으로 제한하도록 하자.

시퀄라이즈에선 일대일과 다대다 등 테이블 간 특정 관계를 맺고 있는 테이블에 대해 관계 쿼리또한 사용할 수 있다.

앞서 정의한 User와 Comment 모델은 hasMany-belongsTo 관계에 있고, 이를 활용한 관계 쿼리를 살펴보자.

우선 유저 정보를 가져올 때 그 사람이 작성한 댓글까지 가져오고 싶은 상황이 있을 수 있다.
그럴 때는 include 옵션을 활용할 수 있다.
그런데 include 옵션을 활용하면 성능상 이슈가 생길 여지는 있다. DB 입장에서 findOne으로 하나의 데이터를 찾는 동시에 include 옵션에 의한 탐색이 이루어지기 때문이다.
그렇다고 사용을 지양해야하는건 아니고, include 방식과 findOne()을 여러번 사용하는것 중 더 성능이 잘 나오는 것을 사용하면 된다.

```js
const user = await User.findOne({
  include: [
    {
      model: Comment,
    },
  ],
});
console.log(user.Comments); // 사용자 댓글
```

한 가지 더 재밌는 방법을 활용할 수 있는데, 시퀄라이즈가 관계에 따라 자동으로 생성해주는 메서드를 활용할 수도 있다는 것이다. 동사 뒤에 모델의 이름이 붙는 식으로 만들어진다.

- getComments(조회)
- setComments(수정)
- addComment, addComments(생성)
- removeComments(삭제)

동사 뒤에 붙는 모델의 이름을 변경하고 싶으면 관계를 설정할 때 as 옵션을 활용할 수 있다.

```js
// 관계 설정할 때 as로 등록
db.User.hasMany(db.Comment, {
  foreignKey: "commenter",
  sourceKey: "id",
  as: "Answers",
});

// 쿼리 사용 시
const user = await User.findOne({});
const comments = await user.getAnswers();
console.log(comments); // 사용자 댓글
```

그리고 include나 관계 쿼리 메서드에도 where이나 attributes 같은 옵션을 사용할 수 있다.

```js
const user = await User.findOne({
  include: [
    {
      model: Comment,
      where: {
        id: 1,
      },
      attributes: ["id"],
    },
  ],
});
```

```js
const comments = await user.getComments({
  where: {
    id: 1,
  },
  attributes: ["id"],
});
```

관계 쿼리에서 조회와 생성, 수정, 삭제는 살짝 다르게 사용한다.

```js
const user = await User.findOne({});
const comment = await Comment.create();
await user.addComment(comment);
// 또는
await user.addComment(comment.id);
```

이렇게 관계를 설정할 대상을 조회한 다음, 쿼리와 관련된 메서드를 사용한다.

그리고 만약 다수의 데이터를 mutate할 경우, 아래와 같이 배열을 활용할 수 있다.

```js
const user = await User.findOne({});
const comment1 = await Comment.create();
const comment2 = await Comment.create();
await user.addComment([comment1, comment2]);
```

마지막으로 시퀄라이즈에선 raw한 쿼리, 즉 일반 sql 문을 입력해서 쿼리를 실행하는 기능 또한 지원한다.

```js
const [result, metadata] = await sequelize.query("select * from comments");
```

시퀄라이즈의 쿼리를 사용할 수 없는 경우에 위 기능을 활용하면 된다고는 하지만, sql문 작성이 더 편하다면 테이블 생성만 시퀄라이즈를 통해, DB 관련 작업은 raw 쿼리를 통해 수행해도 된다.

이제 시퀄라이즈를 활용한 마지막 예제를 실습해보자.
필자는 [이 링크](https://github.com/ZeroCho/nodejs-book/tree/master/ch7/7.6/learn-sequelize)의 코드를 실습했다.

프로젝트를 열어서 `npm i`로 요구 패키지들을 설치하고, config.json에 DB 관련 설정값들을 맞춰주자. 그리고 `npm start` 명령어로 서버를 실행해주면 nunjucks로 만들어진 깔끔한(?) 페이지를 만날 수 있다.

사용자 등록에 이름과 나이 값을 넣어서 데이터를 하나 생성해보자.

<img
  width="800"
  alt="스크린샷 2024-01-14 오전 9 52 49"
  src="https://github.com/sscoderati/cheshier-docs/assets/69716992/2b322f30-b94e-49e0-a00a-3491fd5beaef"
/>
그럼 이렇게 클라이언트에서 POST 요청을 날리고, 응답 코드로 201 Created를 받는 것을
확인할 수 있다. 흐름을 쫓아가보자. 요청 주소는 `/users`였다.

```js
// app.js
// ...
app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/comments", commentsRouter);
// ...
```

일단 app.js에서 이렇게 라우터가 나뉘어있는 것을 확인할 수 있고, 요청 주소에 해당하는 usersRouter로 건너갔음을 짐작할 수 있다.

```js
// routes/users.js
const express = require("express");
const User = require("../models/user");
const Comment = require("../models/comment");

const router = express.Router();

router
  .route("/")
  .get(async (req, res, next) => {
    try {
      const users = await User.findAll();
      res.json(users);
    } catch (err) {
      console.error(err);
      next(err);
    }
  })
  .post(async (req, res, next) => {
    try {
      const user = await User.create({
        name: req.body.name,
        age: req.body.age,
        married: req.body.married,
      });
      console.log(user);
      res.status(201).json(user);
    } catch (err) {
      console.error(err);
      next(err);
    }
  });
// ...
```

`/users`에서 중첩된 라우트는 없었고 post 요청이었으니, `router.route('/').post()`를 타고 `const user = await User.create({})` 코드를 실행했을 것이다. 실제 서버 사이드 콘솔에 관련 로그를 확인할 수 있고, 클라이언트로 201 코드가 전송됐음을 확인할 수 있었다.

댓글을 생성하고 수정과 삭제도 한번 시도해보자.

<img
  width="792"
  alt="스크린샷 2024-01-14 오전 10 06 25"
  src="https://github.com/sscoderati/cheshier-docs/assets/69716992/623da43d-e6f2-4e2c-bda5-f9baba6c2aa8"
/>
rati 유저의 댓글 'hello'를 생성한 뒤, 댓글의 내용을 'world'로 변경했다. 이 요청의
주소는 `/comments/1`이었다.

그러면 이번에 app.js에서 /comments에 해당하기 때문에 commentsRouter로 건너갔음을 짐작할 수 있다.

```js
// routes/comments.js
router
  .route("/:id")
  .patch(async (req, res, next) => {
    try {
      const result = await Comment.update(
        {
          comment: req.body.comment,
        },
        {
          where: { id: req.params.id },
        }
      );
      res.json(result);
    } catch (err) {
      console.error(err);
      next(err);
    }
  })
  .delete(async (req, res, next) => {
    try {
      const result = await Comment.destroy({ where: { id: req.params.id } });
      res.json(result);
    } catch (err) {
      console.error(err);
      next(err);
    }
  });
```

그리고 중첩된 라우트로 1이라는 숫자가 있었는데, 이건 해당 유저의 id였고, 라우트 매개변수 패턴에 해당해 위 코드가 실행됐음을 짐작할 수 있다.
별다른 상태코드를 지정하지 않았기에 기본값인 200 OK가 클라이언트로 보내졌을 것이고, 역시 서버 사이드 콘솔에서 관련 쿼리가 실행되었음을 확인할 수 있다.
