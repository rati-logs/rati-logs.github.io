## 제로초의 Node.js 교과서 섹션 3 요약

### 4.1 요청과 응답 이해하기

요청과 응답은 클라이언트와 서버 사이에서 이루어진다. 클라이언트는 요청을 하는 주체이고, 서버는 응답을 보내주는 주체이다. 그리고 이 둘의 요청과 응답은 HTTP(Hyper Text Transfer Protocol) 프로토콜을 준수하며 이루어진다.

이 요청은 일종의 이벤트로 이해할 수 있고, 요청에 따른 응답을 내려주려면 노드 서버에는 일종의 이벤트 리스너가 있어야 한다. 어떻게 만들 수 있을까?

```js
const http = require("http");

http.createServer((req, res) => {
  // 응답에 관한 로직
});
```

http 모듈의 createServer 메서드를 활용하면 된다. req(요청), res(응답) 두 콜백을 인자로 받게되며, 아래와 같이 추가적인 로직들을 작성할 수 있다.

```js
const http = require("http");

const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
  res.write("<h1>Hello Node!</h1>");
  res.end("<p>Hello Server!</p>");
});
server.listen(8080);

server.on("listening", () => {
  console.log("8080번 포트에서 서버 대기 중입니다!");
});
server.on("error", (error) => {
  console.error(error);
});
```

이렇게 코드를 작성하고 노드로 해당 스크립트를 실행하면 아주 간단한 형태의 응답을 보내줄 수 있는 서버가 만들어지게 된다.
이 서버는 8080 포트에 요청이 들어오면 HTTP 상태코드 200과 HTML 문자열을 응답으로 보내는 로직을 수행한다.

- `res.writeHead()`: 응답 헤더 작성
- `res.write()`: 응답 바디 작성
- `res.end()`: 응답 종료

아 그리고 `server.listen()`은 첫번째 인자로 포트 번호, 두번째 인자로 포트 연결이 완료된 후 실행될 콜백 함수를 넘길 수 있는데, 포트 번호만 넘기고 위와 같이 listening 이벤트 리스너를 등록해서 거기에 콜백 함수를 넘겨도 된다.

그런데 위의 서버는 단 2줄로 이루어진 HTML 문자열을 보내는 상황이지만, 일반적인 웹 사이트의 경우 수백줄에 달하는 긴 HTML 문자열로 이루어져있기 때문에, 이 문자열들에 대응하는 코드를 일일이 입력하기는 매우 번거롭다. 그래서 노드에서는 fs 모듈을 활용해서 HTML 파일을 읽은 다음에 보내는 방법 또한 지원한다.

예를 들어 아래와 같은 내용의 HTML 파일이 있다고 하자.

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Node.js 웹 서버</title>
  </head>
  <body>
    <h1>Node.js 웹 서버</h1>
    <p>만들 준비되셨나요?</p>
  </body>
</html>
```

이 HTML 파일의 이름이 `server2.html`일 때, 아래와 같이 읽어서 보내줄 수 있다.

```js
const http = require("http");
const fs = require("fs").promises;

http
  .createServer(async (req, res) => {
    try {
      const data = await fs.readFile("./server2.html");
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(data);
    } catch (err) {
      console.error(err);
      res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
      res.end(err.message);
    }
  })
  .listen(8081, () => {
    console.log("8081번 포트에서 서버 대기 중입니다!");
  });
```

### 4.2 REST와 라우팅 사용하기

웹에 대해 공부하다보면 REST API라는 용어를 한번 쯤 듣게된다. 이게 뭘까?
REST API, RESTful API는 동일한 용어라고 생각한다.
일단 둘 다 서버의 입장에서 '알아듣기 편한' API이다. '알아듣기 편하다'는 표현은 주관적이지만 이미 RESTful한 API를 작성하는 것은 하나의 규칙처럼 다뤄지고 있다.

- /user : user에 관한 데이터를 요청
- /post : 게시글에 관한 데이터를 요청

이 라우팅(주소)에 HTTP 메서드를 조합해서 API의 '목적'을 표현하게 된다.
(ex: POST /post -> 게시글 생성, DELETE /post -> 게시글 삭제)

이렇게 보면 REST API는 매우 좋은 녀석 같지만, 실제로 REST를 엄격하게 준수하는 서버는 흔치 않다. REST를 준수하기 위한 규칙 중 하나는 라우팅명에 동사를 사용하지 않는 것인데, 이 규칙마저 준수하기 매우 어려운 편이다.
그래서 그냥 API를 작성할 때는 REST에 기반하되, 되도록 깔끔한 라우팅명을 갖도록 작성하는 것이 중요하다.

간단한 REST API 서버 코드 예제를 살펴보자.

```js
const http = require("http");
const fs = require("fs").promises;
const path = require("path");

const users = {}; // 데이터 저장용

http
  .createServer(async (req, res) => {
    try {
      if (req.method === "GET") {
        if (req.url === "/") {
          const data = await fs.readFile(
            path.join(__dirname, "restFront.html")
          );
          res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
          return res.end(data);
        } else if (req.url === "/about") {
          const data = await fs.readFile(path.join(__dirname, "about.html"));
          res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
          return res.end(data);
        } else if (req.url === "/users") {
          res.writeHead(200, {
            "Content-Type": "application/json; charset=utf-8",
          });
          return res.end(JSON.stringify(users));
        }
        // /도 /about도 /users도 아니면
        try {
          const data = await fs.readFile(path.join(__dirname, req.url));
          return res.end(data);
        } catch (err) {
          // 주소에 해당하는 라우트를 못 찾았다는 404 Not Found error 발생
        }
      } else if (req.method === "POST") {
        if (req.url === "/user") {
          let body = "";
          // 요청의 body를 stream 형식으로 받음
          req.on("data", (data) => {
            body += data;
          });
          // 요청의 body를 다 받은 후 실행됨
          return req.on("end", () => {
            console.log("POST 본문(Body):", body);
            const { name } = JSON.parse(body);
            const id = Date.now();
            users[id] = name;
            res.writeHead(201, { "Content-Type": "text/plain; charset=utf-8" });
            res.end("등록 성공");
          });
        }
      } else if (req.method === "PUT") {
        if (req.url.startsWith("/user/")) {
          const key = req.url.split("/")[2];
          let body = "";
          req.on("data", (data) => {
            body += data;
          });
          return req.on("end", () => {
            console.log("PUT 본문(Body):", body);
            users[key] = JSON.parse(body).name;
            res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
            return res.end(JSON.stringify(users));
          });
        }
      } else if (req.method === "DELETE") {
        if (req.url.startsWith("/user/")) {
          const key = req.url.split("/")[2];
          delete users[key];
          res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
          return res.end(JSON.stringify(users));
        }
      }
      res.writeHead(404);
      return res.end("NOT FOUND");
    } catch (err) {
      console.error(err);
      res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
      res.end(err.message);
    }
  })
  .listen(8082, () => {
    console.log("8082번 포트에서 서버 대기 중입니다");
  });
```

`createServer` 메서드의 첫 번째 인자인 `req`를 활용해서 요청 라우트, HTTP 메서드 별로 간단한 로직 처리와 응답을 내려주고 있다.

그리고 중간에 `return res.end(JSON.stringify(users));`라는 코드를 볼 수 있는데, 이는 함수의 실행 종료를 위한 것이다. (`res.end()`를 호출한다고 함수가 알아서 종료되지 않으므로 이렇게 해야한다.)

### 4.3 쿠키와 세션 이해하기

쿠키와 세션은 모두 사용자의 인증과 인가를 위해 만들어진 것이다. 그래서 로그인과 로그아웃을 구현하려면 필수적으로 알고 있어야하는 개념이다.

우선 쿠키는 `키-값`쌍의 단순한 데이터이며, 요청의 헤더에 담겨 전송되고, 브라우저는 응답의 헤더를 읽어 이를 브라우저에 저장한다. 아래 코드를 보자.

```js
const http = require("http");

http
  .createServer((req, res) => {
    console.log(req.url, req.headers.cookie);
    res.writeHead(200, { "Set-Cookie": "mycookie=test" });
    res.end("Hello Cookie");
  })
  .listen(8083, () => {
    console.log("8083번 포트에서 서버 대기 중입니다!");
  });
```

앞서 `writeHead()`는 헤더를 작성하는 메서드라고 서술한 바 있다. 이 서버는 요청의 주소와 요청의 헤더에 담긴 쿠키를 읽어서 출력하고, `mycookie=test`라는 정보를 담은 쿠키를 헤더에 담은 응답을 전송한다.
HTTP 요청과 응답 모두 헤더와 본문(바디)로 구성되지만, 쿠키는 요청과 응답에 있어 부가적인 정보를 주로 담고 있기 때문에 헤더에 담기게 된다.

쿠키를 로그인과 로그아웃을 구현할 때는 어떻게 활용할 수 있을까? 아래 예제를 살펴보자.

```js
const http = require("http");
const fs = require("fs").promises;
const path = require("path");

const parseCookies = (cookie = "") =>
  cookie
    .split(";")
    .map((v) => v.split("="))
    .reduce((acc, [k, v]) => {
      acc[k.trim()] = decodeURIComponent(v);
      return acc;
    }, {});

http
  .createServer(async (req, res) => {
    const cookies = parseCookies(req.headers.cookie); // { mycookie: 'test' }
    // 주소가 /login으로 시작하는 경우
    if (req.url.startsWith("/login")) {
      const url = new URL(req.url, "http://localhost:8084");
      const name = url.searchParams.get("name");
      const expires = new Date();
      // 쿠키 유효 시간을 현재시간 + 5분으로 설정
      expires.setMinutes(expires.getMinutes() + 5);
      res.writeHead(302, {
        Location: "/",
        "Set-Cookie": `name=${encodeURIComponent(
          name
        )}; Expires=${expires.toGMTString()}; HttpOnly; Path=/`,
      });
      res.end();
      // name이라는 쿠키가 있는 경우
    } else if (cookies.name) {
      res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
      res.end(`${cookies.name}님 안녕하세요`);
    } else {
      try {
        const data = await fs.readFile(path.join(__dirname, "cookie2.html"));
        res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
        res.end(data);
      } catch (err) {
        res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
        res.end(err.message);
      }
    }
  })
  .listen(8084, () => {
    console.log("8084번 포트에서 서버 대기 중입니다!");
  });
```

`parseCookie()`는 `key=value`라는 문자열을 `{ key : value }`라는 객체로 파싱하는 임의의 함수이다. 크게 아래의 분기에 따라 동작한다.

- 요청의 주소가 `'/login'`으로 시작하는 경우 쿼리스트링에 포함된 name정보를 포함한 HTTP only 쿠키를 응답으로 돌려주면서 `'/'`, 루트 경로로 리다이렉션시킨다.
- 요청에 이미 name이라는 쿠키가 있는 경우는 단순히 해당 쿠키에서 name을 추출해서 해당 데이터를 포함하는 응답을 내려준다.
- 요청에 name이라는 쿠키가 없다면 `cookie2.html`파일을 읽어와서 응답으로 전송하고, 파일 읽기에 실패하면 에러 메시지의 내용을 반환한다.

그러면 처음 로그인 할 때는 로그인 정보를 갖고있는 쿠키를 서버로부터 발급받고 루트 경로로 돌아오게되며, 루트 경로에 해당하는 페이지를 서버에 요청할 때 해당 쿠키의 존재와 유효성을 확인한 서버가 해당 쿠키에 대응하는 정보를 보내줄 수 있는 것이다.

쿠키는 정보보안 위협으로부터 안전하게 관리되기 위해 아래와 같은 보안 옵션들을 제공한다.

- HttpOnly: 클라이언트의 JavaScript로 접근할 수 없다. XSS 예방에 효과적이다.
- Secure: HTTPS 프로토콜 내에서만 동작하도록 설정한다.
- SameSite: 동일한 도메인에서 보내진 쿠키(퍼스트 파티)와 그렇지 않은 쿠키에 대한 접근 범위를 설정한다.
  그래서 서버에 요청을 보낼 때 필요한 부가적인 정보는 종류가 너무 다양하지 않으면서(키-값 쌍의 개수만큼 쿠키가 나온다...) 크기가 4KB를 넘지 않는다면 쿠키에 저장하는 것이 좋다.

그런데 위와 같이 name 쿠키에 username이 평문으로 노출된다면 보안상 좋지 않을 것이다. 서비스에서 보안 중요도가 높은 정보들은 가급적 서버에서 관리하는 것이 권장된다. 그래서 클라이언트에 보내는 쿠키에 해당 정보에 접근할 수 있는 Key를 주고, 클라이언트가 해당 Key를 통해 서버에서 관리되는 중요한 정보에 접근할 수 있도록 한다면 만약 해커들이 쿠키를 탈취하는 데 성공한다고 해도 쿠키에 저장된 값 자체만으로는 알아낼 수 있는 정보가 많지 않을 것이다. 암호화까지 해버린다면 금상첨화!

아래는 세션 쿠키 방식으로 구현된 예제이다.

```js
const http = require("http");
const fs = require("fs").promises;
const path = require("path");

const parseCookies = (cookie = "") =>
  cookie
    .split(";")
    .map((v) => v.split("="))
    .reduce((acc, [k, v]) => {
      acc[k.trim()] = decodeURIComponent(v);
      return acc;
    }, {});

const session = {};

http
  .createServer(async (req, res) => {
    const cookies = parseCookies(req.headers.cookie);
    if (req.url.startsWith("/login")) {
      const url = new URL(req.url, "http://localhost:8085");
      const name = url.searchParams.get("name");
      const expires = new Date();
      expires.setMinutes(expires.getMinutes() + 5);
      const uniqueInt = Date.now();
      session[uniqueInt] = {
        name,
        expires,
      };
      res.writeHead(302, {
        Location: "/",
        "Set-Cookie": `session=${uniqueInt}; Expires=${expires.toGMTString()}; HttpOnly; Path=/`,
      });
      res.end();
      // 세션쿠키가 존재하고, 만료 기간이 지나지 않았다면
    } else if (
      cookies.session &&
      session[cookies.session].expires > new Date()
    ) {
      res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
      res.end(`${session[cookies.session].name}님 안녕하세요`);
    } else {
      try {
        const data = await fs.readFile(path.join(__dirname, "cookie2.html"));
        res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
        res.end(data);
      } catch (err) {
        res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
        res.end(err.message);
      }
    }
  })
  .listen(8085, () => {
    console.log("8085번 포트에서 서버 대기 중입니다!");
  });
```

위에서 잠깐 설명한 것 처럼 쿠키에 담기는 것은 중요 정보 그 자체가 아닌 중요 정보에 접근할 수 있는 'Key'이다. 보안적 중요도가 높은 정보의 인가를 쿠키를 활용해서 구현한다면 위와 같이 세션 쿠키 방식으로 구현하는게 좋을 듯 하다.

### 4.4 https와 http2

https는 http 프로토콜에 보안을 강화한 프로토콜이다. 기존의 http는 요청/응답에 대한 정보들이 평문으로 전송되어 packet sniffing 등에 의해 중요한 정보들이 노출될 수 있었고, 이러한 문제는 다른 정보보안 문제를 초래할 수 있어 현재는 해당 정보들이 암호화되어 전송되는 https 프로토콜 사용이 권장되고 있다.
노드에서는 https 적용을 위해 아래와 같은 코드를 작성할 수 있다.

```js
const https = require("https");
const fs = require("fs");

https
  .createServer(
    {
      cert: fs.readFileSync("도메인 인증서 경로"),
      key: fs.readFileSync("도메인 비밀키 경로"),
      ca: [
        fs.readFileSync("상위 인증서 경로"),
        fs.readFileSync("상위 인증서 경로"),
      ],
    },
    (req, res) => {
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.write("<h1>Hello Node!</h1>");
      res.end("<p>Hello Server!</p>");
    }
  )
  .listen(443, () => {
    console.log("443번 포트에서 서버 대기 중입니다!");
  });
```

http2는 Multiplexing을 지원하는 프로토콜로서, 1.1 버전에 비해 요청/응답 전송 속도가 개선되어 실제 프로덕션 서비스에서는 사용하는 것이 좋다.

```js
const http2 = require("http2");
const fs = require("fs");

http2
  .createSecureServer(
    {
      cert: fs.readFileSync("도메인 인증서 경로"),
      key: fs.readFileSync("도메인 비밀키 경로"),
      ca: [
        fs.readFileSync("상위 인증서 경로"),
        fs.readFileSync("상위 인증서 경로"),
      ],
    },
    (req, res) => {
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.write("<h1>Hello Node!</h1>");
      res.end("<p>Hello Server!</p>");
    }
  )
  .listen(443, () => {
    console.log("443번 포트에서 서버 대기 중입니다!");
  });
```

적용 방법은 https 서버를 만드는 것과 같지만, http2 모듈에서 불러오고 `createSecureServer()`라는 메서드를 활용한다는 차이점이 있다.

### 4.5 cluster

cluster는 무엇일까? 이 모듈은 기본적으로 싱글 스레드 기반의 환경인 노드가 CPU 코어를 모두 사용할 수 있게 해주는 모듈이다. 따라서 성능 개선에 도움이 되며, 구체적으로는 아래와 같은 기능들을 제공한다.

- 포트를 공유하는 노드 프로세스 여러 개 실행
- 실행된 서버의 개수만큼 요청 분산
- 코어 하나당 노드 프로세스 할당
  물론 메모리, 세션 등의 로컬 자원을 공유하기 어렵다는 단점도 있고, 그런 단점으로 인한 엣지 케이스 또한 발생할 여지가 있지만, 서버의 성능 개선을 위해 알아두면 좋을 개념이다.
  아래 예제 코드를 살펴보자.

```js
const cluster = require("cluster");
const http = require("http");
const numCPUs = require("os").cpus().length;

if (cluster.isMaster) {
  console.log(`마스터 프로세스 아이디: ${process.pid}`);
  // CPU 개수만큼 워커를 생산
  for (let i = 0; i < numCPUs; i += 1) {
    cluster.fork();
  }
  // 워커가 종료되었을 때
  cluster.on("exit", (worker, code, signal) => {
    console.log(`${worker.process.pid}번 워커가 종료되었습니다.`);
    console.log("code", code, "signal", signal);
    cluster.fork();
  });
} else {
  // 워커들이 포트에서 대기
  http
    .createServer((req, res) => {
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.write("<h1>Hello Node!</h1>");
      res.end("<p>Hello Cluster!</p>");
      setTimeout(() => {
        // 워커 존재를 확인하기 위해 1초마다 강제 종료
        process.exit(1);
      }, 1000);
    })
    .listen(8086);

  console.log(`${process.pid}번 워커 실행`);
}
```

클러스터는 어쩌면 워커쓰레드와 닮아있다고 얘기할 수 있다. 단지 프로세스를 여러개 생성하느냐, 쓰레드를 여러개 생성하느냐 라고 하는 차이점만 있을 뿐이다.
그래서 워커쓰레드를 활용하는 코드와 비슷한 결에서 생각해볼 수 있다.
여러개의 워커를 만들고, 워커에 포트를 공유하는 노드 서버를 하나씩 연결시킨다. 그러면 마스터 프로세스가 들어온 요청들에 대해 이들을 분산시키고, 워커는 이들을 하나씩 할당받아 처리하게 되는 것이다.
