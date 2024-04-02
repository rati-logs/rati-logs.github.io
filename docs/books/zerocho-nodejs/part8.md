## 제로초의 Node.js 교과서 섹션 8 요약

### 9.1 프로젝트 구조 갖추기

- 요구 의존성: sequelize, mysql2, sequelize-cli, express, cookie-parser, express-session, morgan, multer, dotenv, nunjucks
- 요구 개발의존성:  nodemon
- 사용 데이터베이스: MySQL

폴더 구조는 아래와 같다.

```bash
├── config
├── migrations
├── models
├── passport
├── public
├── routes
├── seeders
└── views
```

routes에는 각 페이지의 라우터가 들어가고, views에는 페이지별로 보여줄 넌적스 코드가 들어간다.

routes/page.js는 아래와 같이 구성할 수 있는데,

```js
const express = require('express');
const router = express.Router();
// const { renderMain, renderProfile, renderJoin } = require('../controllers/page');

router.get('/profile', renderProfile);
router.get('/join', renderJoin);
router.get('/', renderMain);

module.exports = router;
```

이 때 router.get()처럼 라우터의 마지막 미들웨어는 'Controller'라고 부르는데, 이 코드의 실행에 필요한 renderXXX 함수는 이 파일에서 구현해도 되지만 별도로 분리해서 관리하는 것이 추후 테스트를 수행하거나 유지보수 관점에서 편리하다.

즉, 아래와 같이 분리한 다음에 routes/pages.js에서 불러오도록 작성해주자.

```js
// controllers/page.js
exports.renderProfile = (req, res, next) => {
  res.render('profile', { title: '내 정보 - NodeBird' });
}
exports.renderJoin = (req, res, next) => {
  res.render('join', { title: '회원가입 - NodeBird' });
}
exports.renderMain = (req, res, next) => {
  const twits = [];
  res.render('main', {
    title: 'NodeBird',
    twits,
  });
}
```



### 9.2 데이터베이스 세팅하기

