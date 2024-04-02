## 제로초의 Node.js 교과서 섹션 5 요약

### 6.1 익스프레스 프로젝트 시작하기

Express는 node 기반의 서버 개발 프레임워크로서, npmtrends 상 여타 경쟁자들 대비 가장 높은 다운로드수를 자랑한다. 업데이트도 꾸준하고 압도적인 사용자 수로 인한 커뮤니티 활성도도 높아서 좋은 옵션인 것 같다.

express는 웹서버를 아주 간단하고 쉽게 만들 수 있다. http 모듈은 이제 더이상 쓰지 않는다고 봐도 무방하다.
일단 실습을 위해 노드 프로젝트를 하나 init해주고, 일반 의존성으로 `express`, 개발 의존성으로 `nodemon`을 설치해주자.

그리고 `app.js`를 생성하고 아래와 같이 작성해주자.

```js
const express = require("express");

const app = express();

app.set("port", process.env.PORT || 3000); // 추후 dotenv로 관리
app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.post("/", (req, res) => {
  res.send("Got a POST request");
});

app.get("/user", (req, res) => {
  res.send("Got a GET request at /user");
});

app.listen(3000, () => {
  console.log("Server started on port 3000");
});
```

http 모듈을 활용해 서버를 만들 때보다 훨씬 간편해졌다.

그리고 이렇게 작성한 서버를 실행하려면 `node app` 커맨드를 입력해야했지만, 아까 설치했던 `nodemon`을 통해 서버를 실행해주면 개발 시 소스 코드에 변경이 생기면 알아서 변경사항을 적용하기 위해 서버를 재시작해주기 때문에 편리하다.

이제 express를 활용해서 HTML 파일을 Serving해보자.

```js
const express = require("express");
const path = require("path");

const app = express();

app.set("port", process.env.PORT || 3000); // 추후 dotenv로 관리
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(3000, () => {
  console.log("Server started on port 3000");
});
```

루트 경로에 대한 get 요청이 들어올 때 `sendFile()`메서드에 `'./index.html'`이라는 경로를 넣어주면 이 `sendFile()`은 알아서 fs 모듈을 불러와 파일을 읽어낼 수 있다.

하지만 경로에 관한 입력값은 엄격하게 관리될 필요가 있으므로, path 모듈을 활용해 아래와 같이 적어줄 수 있다.

```js
res.sendFile(path.join(__dirname, "index.html"));
```

`__dirname`은 현재 디렉토리를 의미하기에, `join()` 메서드의 인자의 의미는 `현재 디렉토리의 index.html`이 된다.

### 6.2 자주 사용하는 미들웨어

미들웨어는 axios의 인터셉터를 생각하면 된다. 클라이언트의 요청을 전처리하거나, 서버의 응답을 후처리 할 수 있다. 사용법도 간단하다.

```js
app.use((req, res, next) => {
  console.log("모든 요청에 다 실행됩니다.");
  next(); // 계속해서 다음 미들웨어로 넘어가는 함수
});
```

대신 이 미들웨어 실행 코드는 라우터에 해당하는 코드의 상단에 위치해야 한다(JS 엔진이 코드를 위에서 아래로 읽으니까).

주소를 첫번째 인자로 넣으면 특정 라우트에서만 실행되고, 넣지 않으면 모든 라우트에서 실행된다. 아래 예제를 보자.

```js
...
app.set('port', process.env.PORT || 3000);

app.use((req, res, next) => {
  console.log('모든 요청에 다 실행됩니다.');
  next(); // 계속해서 다음 미들웨어로 넘어가는 함수
});

app.get('/', (req, res, next) => {
  console.log('GET / 요청에만 실행됩니다');
  next();
}, (req, res) => {
	throw new Error('에러는 에러 처리 미들웨어로 갑니다.');
});

app.use((err, req, res, next) => {
// 에러 미들웨어는 next 인자를 꼭 넣어주자
  console.error(err);
  res.status(500).send(err.message);
});

app.listen(app.get('port'), () => {
	...
})
```

이 예제에서는 첫 번째 인자로 특정 라우트 주소 대신 에러 객체를 받아 바로 위 요청에 대한 에러 처리를 위임받아 처리하고 있다.

예제에서처럼 미들웨어가 에러를 단순히 throw할 수도 있지만, 아래와 같이 처리할 수도 있다.

```js
app.get('/', (req, res, next) => {
  console.log('GET / 요청에만 실행됩니다');
    next();
  }, (req, res, next) => {
    try {
      // 에러가 날 수도 있는 작업
    } catch (error) {
      next(error)
    }
});

...

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send(err.message);
});
```

그리고 `next()`는 한가지 특수한 기능이 있는데, `next('route')`처럼 `'route'`를 인자로 넣어주면 다음 미들웨어를 현재 탐색중인 라우트 함수 스코프에서 벗어나서 찾게 된다.

```js
app.get(
  "/",
  (req, res, next) => {
    console.log("GET / 요청에만 실행됩니다");
    next("route");
  },
  (req, res) => {
    throw new Error("에러는 에러 처리 미들웨어로 갑니다.");
  }
);

app.get("/", (req, res) => {
  console.log("GET / 요청에만 실행됩니다2");
});
```

이런 코드가 있고, 루트 경로에 대한 GET 요청이 들어왔다고 했을 때 `next('route')`를 호출했기 때문에 에러가 발생하는 것이 아니라 `console.log('GET / 요청에만 실행됩니다2');` 코드가 실행되는 것이다.

노드의 이런 유용한 미들웨어를 실무에서 활용하기 위해 만들어진 좋은 라이브러리들이 있다.

- morgan
- cookie-parse
- express-session
  환경 변수 활용을 위해 dotenv 패키지와 함께 아래 명령으로 설치해주자.

```bash
npm i morgan cookie-parser express-session dotenv
```

#### 6.2.1 morgan

morgan은 요청과 응답에 대한 추가적인 정보를 콘솔에 로깅해주는 라이브러리다.
미들웨어로 취급되고, 따라서 아래와 같이 사용할 수 있다.

```js
app.use(morgan("dev")); // 개발 환경
app.use(morgan("combined")); // 배포 환경
```

그리고 서버에 접속하면 이런 추가적인 로그를 볼 수 있다.

```bash
GET / 500 25.087 ms - 50
GET /favicon.ico 404 1.293 ms - 150
```

내 경우에는 뭔가 에러가 터져서 저런 로그가 찍힌거고, 보통 아래와 같은 형식의 로그가 찍힌다.
`[HTTP 메서드] [라우트] [상태 코드] [응답속도] - [응답 바이트]`

#### 6.2.2 static

static도 미들웨어다. express에 기본 내장돼있어서 그냥 require로 꺼내오면 되고, 정적인 파일을 제공할 때 사용한다.
아래와 같이 사용할 수 있다.

```js
app.use("요청 경로", express.static("실제 경로"));

// 예시
app.use("/", express.static(path.join(__dirname, "public")));
```

위 예시에서 public을 정적 파일 제공용 주소로 설정했으므로, `public/stylesheet/style.css`를 가져오고 싶다면 `http://localhost:3000/stylesheet/style.css`로 요청하면 된다.
요청 주소와 실제 파일이 위치한 주소가 다르기 때문에 보안 강화에 도움이 된다.

그리고 static 미들웨어는 여타 미들웨어와 다르게 내부적으로 `next()`를 실행하지 않기 때문에, 이 점을 유의해서 사용하자.

#### 6.2.3 body-parser

요청의 본문에 있는 데이터를 읽어서 req.body 객체로 만들어주는 미들웨어다. 단, 멀티파트 데이터는 처리하지 못하는데, 이는 multer 패키지를 사용하면 된다.

```js
app.use(express.json()); // JSON 읽기
app.use(express.urlencoded({ extended: false })); // URL-encoded 읽기
app.use(express.raw()); // RAW 데이터 읽기
app.use(express.text()); // Text 데이터 읽기
```

body-parser는 익스프레스 v4.17.0부터 내장되어 이제 익스프레스가 설치돼있다면 바로 사용할 수 있다.

다른 예시와 다르게 url-encoded 메서드의 경우 `{ extended: false }`를 인자로 넘기는 것을 볼 수 있는데, extended가 false면 노드의 querystring 모듈을 활용해서 쿼리스트링을 해석하고, true면 qs 모듈을 활용한다는 차이점이 있다. qs는 외부 라이브러리라서 별도의 설치가 필요하지만, querystring 모듈의 기능을 확장한 것이다. qs가 훨씬 강력한 기능들을 제공하기 때문에 extend 옵션은 웬만하면 true로 넣고 쓰자.

#### 6.2.4 cookie-parser

cookie-parser는 요청에 담긴 쿠키를 읽어 `req.cookies` 객체로 만드는 미들웨어다.
만약 유효기간이 지난 쿠키라면 알아서 걸러준다. (작동하지 않음)

```js
app.use(cookieParser(SECRET_KEY));
```

첫 번째 인자로 비밀 키를 넣어줄 수 있고, 서명된 쿠키의 경우 이 비밀 키를 활용해 쿠키의 유효성을 검증한다. 서명된 쿠키는 `name=sscoderati.sign`의 형태가 되고, 서명된 쿠키는 `req.singedCookies`에 들어간다.

오해하면 안되는 부분은 cookie-parser는 쿠키를 읽어내는 것이지 생성하거나 삭제하는 용도로 사용하는 것이 아니라는 점이다. 생성할 때는 `res.cookie`, `res.clearCookie`를 사용한다.

- `res.cookie(key, value, option)`
- `res.clearCookie(key, value, option)`
  그리고 쿠키를 삭제할 때는 키, 값 외에 옵션까지 동일(expires, maxAge 옵션 제외)해야 지워진다는 점을 기억하자.

쿠키의 옵션 중 `singed`라는 옵션이 있는데, 이게 `true`면 쿠키에 서명이 붙는다.

#### 6.2.5 express-session

세션 관리용 미들웨어다. 사용자별로 `req.session` 객체 안에 유지된다.

```js
const session = require("express-session");

app.use(
  session({
    resave: false,
    saveUninitialized: false,
    secret: process.env.COOKIE_SECRET,
    cookie: {
      httpOnly: true,
      secure: false,
    },
    name: "session-cookie", // default: connect.sid
  })
);
```

옵션에 대한 설명은 아래와 같다.

- resave: 요청이 올때 세션에 수정사항이 생기지 않더라도 세션을 다시 저장할지
- saveUninitialized: 세션에 저장할 내역이 없더라도 처음부터 세션을 생성할지
- secret: 쿠키와 동일. 비밀 키
- cookie: 세션 쿠키의 옵션
- name: 세션 쿠키 이름
- store: 세션의 저장 위치. 메모리에 저장하면 초기화시 사라지므로 redis 등의 저장소에 연결해서 사용.

#### 6.2.6 미들웨어의 특성 활용하기

미들웨어의 특성을 정리해보자. 미들웨어는 에러 처리를 위한 것을 제외하고 req, res, next 3개의 인자를 갖는 함수이고, 첫번째 인자로 주소를 넣으면 해당 라우트에서만 실행된다.

next를 이용하면 여러 개의 미들웨어를 연결할 수 있고, next를 호출하지 않는 미들웨어는 res.send 등으로 요청에 대한 응답을 내려줘야한다.

'route'라는 문자열을 넣으면 다음 라우트의 미들웨어로 실행 흐름이 이동하고, 그 외의 인자를 주면 에러 처리 미들웨어로 이동한다. 그리고 이 인자는 해당 에러 처리 미들웨어의 첫번째 인자인 err 객체에 담긴다.

미들웨어 간 데이터를 전달하려면 어떻게 해야할까?
일단 let으로 변수를 선언하거나 `app.set()`으로 전달하면 익스프레스 앱 전역적으로 이 데이터를 조회할 수 있기 때문에 노출되면 큰일나는 데이터를 이렇게 전달했다간 대형 사고가 날 수 있다. 따라서 아래와 같은 방법을 사용할 수 있다.

- req.session에 저장
- res.locals에 저장

req.session에 저장하면 안전하긴 하지만, 세션이 유지되는 동안 데이터가 사라지지 않는다는 단점이 있다.
요청이 끝났을 때 데이터도 같이 날리고 싶으면 res.locals에 저장하면 된다.

```js
app.use(
  (req, res, next) => {
    res.locals.data = "data";
    next();
  },
  (req, res, next) => {
    console.log(res.locals.data); // data
    next();
  }
);
```

그리고 미들웨어는 한 가지 유용한 패턴을 적용할 수 있는데, 내부적으로 다른 미들웨어를 포함해서 확장이 가능하다.

```js
app.use((req, res, next) => {
  morgan("dev")(req, res, next);
});
```

아래 코드처럼 분기 처리도 가능하다.

```js
app.use((req, res, next) => {
  if (process.env.NODE_ENV === "production") {
    morgan("combined")(req, res, next); // 확장
  } else {
    morgan("dev")(req, res, next); // 확장
  }
});
```

#### 6.2.7 multer

multer는 멀티파트 형식의 데이터를 처리하는 미들웨어다. 외부 패키지이므로 따로 설치해줘야한다.

```bash
npm i multer
```

multer 함수를 호출한 반환값에는 4가지의 미들웨어가 포함돼있다.
일단 기본적인 설정부터 알아보자.

```js
const multer = require("multer");
const fs = require("fs");

try {
  fs.readdirSync("uploads");
} catch (error) {
  console.error("uploads 폴더가 없어 uploads 폴더를 생성합니다.");
  fs.mkdirSync("uploads");
}
const upload = multer({
  storage: multer.diskStorage({
    destination(req, file, done) {
      done(null, "uploads/");
    },
    filename(req, file, done) {
      const ext = path.extname(file.originalname);
      done(null, path.basename(file.originalname, ext) + Date.now() + ext);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
});
```

storage 옵션의 `multer.diskStorage()`는 데이터를 내부 디스크에 저장할 때 사용한다. 중간 서버로서 데이터를 메모리에 임시로 저장하거나 외부 클라우드 스토리지(AWS S3, Google Drive 등)에 저장할 때는 다른 메서드를 사용한다.

diskStorage() 함수의 destination()과 filename()은 각각 어디에 어떤 파일로 저장할 것인지에 관한 정보를 다룬다. 두 함수의 공통 인자인 req에는 요청에 대한 정보가, file 객체는 업로드한 파일에 대한 정보가 담겨있고, done은 함수다.
req나 file의 데이터를 가공해서 done으로 넘겨주는 식으로 보통 사용한다.
done은 아래처럼 작성하면 된다.

```js
done(fail, success); // fail은 실패시 반환할 값, success는 성공시 반환할 값
```

limits 옵션은 업로드에 대한 제한 사항을 설정할 수 있으며, 예시에서의 fileSize는 파일의 크기를 제한하는 옵션이다. (단위는 바이트)

이렇게 설정을 마친 upload 상수는 다양한 미들웨어를 포함하게 된다.
우선 클라이언트에서 파일을 하나만 업로드 할 때는 `single` 미들웨어를 사용한다.

```js
app.post("/upload", upload.single("image"), (req, res) => {
  console.log(req.file); // req.file에 파일에 대한 정보가 들어있다.
  res.send("ok");
});
```

이 single 미들웨어를 특정 라우트 미들웨어 앞에 넣어두면, 특정 라우트에 대해 작동한다. 그리고 single 미들웨어의 인자로 넘어간 `'image'`문자열은 일종의 키로서, 클라이언트에서 전송할 데이터의 이름(name)과 일치해야한다.

다수의 파일을 업로드해야하는 경우는 어떻게 할까? 그럴 때는 `array` 미들웨어를 사용하면 된다.

```js
app.post("/upload"),
  upload.array("many"),
  (req, res) => {
    console.log(req.files, req.body); // req.files에 데이터가 들어있다.
    res.send("ok");
  };
```

그런데 여러 개의 파일을 업로드하지만 각 데이터의 이름이 다른 경우도 있을 수 있다. 그럴 때는 `fields` 미들웨어를 사용한다.

```js
app.post('upload'), upload.fields([{ name: img1 }, { name: img2 }, { name: img3 }]), (req, res) => {
  console.log(req.files, req.body);
  res.send('ok');
  },
);
```

이 경우 files에 데이터가 모두 들어있지만, 개별적으로 참조할 수 있다. (`req.files.img1`, `req.files.img2`)

마지막으로 특수한 경우이지만, 따로 무슨 파일을 전송하지는 않지만 멀티파트 데이터로 업로드하는 경우도 있을 수 있다. 그럴 때는 `none` 미들웨어를 사용한다.

```js
app.post("/upload", upload.none(), (req, res) => {
  console.log(req.body); // 파일이 없으므로 body만 존재
  res.send("ok");
});
```

### 6.3 Router 객체로 라우팅 분리하기

지금까지는 실습을 위해 app.js에 모든 라우팅 관련 코드를 때려박았는데, 그러면 가독성도 좋지 않고 유지보수성도 나빠진다.

라우팅 코드를 분리하기 위해 사용할 수 있는 것이 익스프레스의 Router 객체인데, 아래와 같이 사용한다. 예를 들어 app.js에 아래와 같은 루트 경로에 대한 라우팅 코드가 있다고 하자.

```js
// app.js

app.get("/", (res, req) => {
  console.log("/ GET 요청에 의해 실행됩니다.");
  res.send("Hello World!");
});
```

이 코드를 `routes/index.js`에 분리해보자. 위 코드는 복사 후 제거한다.

```js
// routes/index.js

const express = require("express");

const router = express.Router();

router.get("/", (req, res) => {
  console.log("/ GET 요청에 의해 실행됩니다.");
  res.send("Hello World!");
});

module.exports = router;
```

위와 같이 작성하고, 다시 app.js에 아래와 같은 코드를 작성해주자.

```js
// app.js
const indexRouter = require("./routes");

// ...
app.use("/", indexRouter);
// ...
```

이렇게 해당 라우터 파일을 require한 반환값을 app.use에 해당 경로와 함께 인자로 넘겨주면 라우팅 코드를 분리할 수 있다.

동적으로 변하는 라우트 주소에 대해서는 '라우트 매개변수'라고 불리는 패턴을 사용할 수 있다. 아래와 같이 사용한다.

```js
router.get('/user/:id'), (req, res) => {
  console.log(req.params, req.query);
});
```

위 경우에는 `/user/123`, `/user/456`등 동적으로 변하는 라우트 주소에 대해 작동하고, `:id`라고 하는 매개변수는 `req.params.id`로 가져올 수 있다.
쿼리스트링의 경우 req.query 객체에 담겨온다.

만약 의도된 특정 라우트 주소가 위 패턴에 대응하는 경우 (ex: /user/likes), 라우트 매개변수를 활용하는 코드를 해당 라우팅 코드보다 뒤에 오도록 해야 해당 코드가 무시되지 않는다.

### 6.4 req, res 객체 살펴보기

익스프레스의 req, res는 앞서 배운 http 모듈의 req, res 객체를 확장한 것이다. 따라서 기존 객체의 메서드도 활용할 수 있고, 익스프레스의 기능을 활용할 수도 있다.
익스프레스의 req, res에서 아주 많은 기능이 확장되었지만, 자주 활용되는 속성 또는 메서드를 살펴보자.

- req
  - req.app
  - req.body
  - req.cookies
  - req.ip
  - req.params
  - req.query
  - req.signedCookies
  - req.get(HeaderName)
- res
  - res.app
  - res.cookie(key, value, options)
  - res.clearCookie(key, value, options)
  - res.end()
  - res.json(JSON)
  - res.locals
  - res.redirect(address)
  - res.render(view, data)
  - res.send(data)
  - res.sendFile(path)
  - res.set(header, value)
  - res.status(code)

req나 res의 메서드는 보통 아래와 같이 체이닝이 가능하다.

```js
res.status(200).cookie("test", "test").redirect("/admin");
```

### 6.5 템플릿 엔진 사용하기

템플릿 엔진은 정적인 언어인 HTML의 단점을 극복하기 위해 만들어진 기능이다. 조건문 ,반복문, 변수 등을 HTML에서 사용할 수 있도록 확장해주며, 어느정도 동적인 페이지를 만들 수 있게 된다. [EJS](https://ejs.co/), [Pug(구 Jade)](https://pugjs.org/api/getting-started.html), [Nunjucks](https://mozilla.github.io/nunjucks/), [handlebars](https://handlebarsjs.com/) 등이 있고 EJS는 기능이 너무 부족해서 현재는 잘 사용하지 않는다.

이 책에서는 Pug와 Nunjucks에 대해 조금만 알아보자.
일단 Pug나 Nunjucks나 템플릿 엔진을 사용하기 위해 설정이 필요한데, 단 2줄이면 된다.

```js
// app.js
// ...
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");
// ...
```

`views/` 경로에서 템플릿 엔진에 관한 파일을 사용하고, 어떤 엔진을 사용할 것인지를 설정하는 코드를 작성하는 것이다. 그럼 `res.render('index')`라는 코드를 실행했을 때 `views/index.pug`를 렌더링하게된다.

우선 Pug는 문법이 간단하고, Ruby와 비슷한 면이 있어 기존에 Ruby를 사용하던 유저는 쉽게 적응할 수 있다. 물론 그렇지 않더라도 문법이 매우 쉬워 인기가 많다고 한다.
단, HTML의 문법과는 약간 거리가 있어서 호불호는 갈리는 편이다.

<img
  width="320"
  height="240"
  src="https://camo.githubusercontent.com/39bbefb1bf36e167b3a2699997e04505e96f5ead6d6f4004b50b33859f1ca4d9/68747470733a2f2f63646e2e7261776769742e636f6d2f7075676a732f7075672d6c6f676f2f656563343336636565386664396431373236643738333963626539396431663639343639326330632f5356472f7075672d66696e616c2d6c6f676f2d5f2d636f6c6f75722d3132382e737667"
/>

Nunjucks는 퍼그와 달리 HTML 문법에 친화적이며, '그' 유명한 MDN을 만든 Mozilla에서 만든 템플릿 엔진이다.
Pug와 달리 확장자가 .njk이지만, .html도 지원한다!
Nunjucks를 사용할 때는 아래와 같이 설정하면 된다.

```js
// app.js
// ...
const nunjucks = require("nunjucks");
// ...
app.set("view engine", "html");

nunjucks.configure("views", {
  // 'views'는 템플릿 파일 경로
  express: app, // app 객체를 express 속성으로 등록
  watch: true, // html 파일이 변경되면 템플릿 엔진을 리렌더링
});
```

Pug와 Nunjucks의 문법 자체는 이 문서에서 다루지 않겠지만, 예제 실습을 통해 천천히 익혀나갈 예정이다.

그래도 Nunjucks를 활용해서 에러페이지 하나는 만들어보자.
우선 미들웨어는 아래와 같이 작성해준다.

```js
// ...
app.use((req, res, next) => {
  const error = new Error(`${req.method} ${req.url} 라우터가 없습니다.`);
  error.status = 404;
  next(error);
});

app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = process.env.NODE_ENV !== "production" ? err : {};
  res.status(err.status || 500);
  res.render("error");
});

// ...
```

그리고 views/error.html에 다음과 같이 작성해준다.

```html
{% extends 'layout.html' %} {% block content %}
<h1>{{message}}</h1>
<h2>{{error.status}}</h2>
<pre>{{error.stack}}</pre>
{% endblock %}
```

그러면 에러가 발생했을때 아래와 같은 페이지가 보이게 된다!
![nunjucks_error](https://blogdocsimages.s3.ap-northeast-2.amazonaws.com/20240402132900_50L1vs)
