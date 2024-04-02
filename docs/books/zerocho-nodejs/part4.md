## 제로초의 Node.js 교과서 섹션 4 요약

### 5.1 npm 알아보기

npm은 Node Package Manager로, node 기반의 프로젝트, 특히 로컬 환경에서 프론트엔드 개발환경을 구축해본 경험이 있다면 너무나도 친숙한 존재이다. npm을 통해 프로젝트에 적합한 라이브러리를 찾아 설치하고, 업데이트하거나 삭제할 수 있었다.
현재까지도 npm은 yarn, pnpm 등 다른 노드 패키지 매니저에 비해 가장 높은 점유율을 갖고 있으며, 탄탄한 유저층을 기반으로 커뮤니티 또한 가장 크게 활성화되어있다.
npm을 활용하기 위해서는 `package.json`이라는 파일에 대해 알아야한다.

### 5.2 package.json으로 패키지 관리하기

package.json은 노드 패키지(노드는 모듈을 라이브러리 관점에서 패키지라고 부르기도 한다)에 관한 필수적인 정보들을 종합한 JSON 형식의 파일이다.

```json
{
	"name": "test_project",
	"version": "1.0.0",
	"description": "",
	"main": "index.js"
	"scripts": {
		"test": "echo \"Error: no test specified\" && exit 1"
	},
	"author": "sscoderati",
	"license": "MIT"
}
```

보통 `npm init` 커맨드를 통해 node 프로젝트를 시작하게되면 CLI에서 채우라는거 다 채웠을 때 위와 같은 정보들을 가진 `package.json`이 생성된다.

- name: 프로젝트 이름
- version: 프로젝트 버전
- description: 프로젝트 설명
- main: 프로젝트 실행 스크립트 파일명
- scripts: 프로젝트에 관한 커맨드 정의. 별칭과 실제 터미널에 입력할 커맨드셋을 등록한다. ex) `"dev": "parcel ./index.html"`로 등록하면 `npm run dev` 커맨드를 통해 `"parcel ./index.html"` 커맨드를 실행할 수 있다.
- author: 프로젝트 작성자명
- license: 프로젝트 라이센스 범위 설정

이렇게 `package.json`이 생성되면 라이브러리 설치를 위한 명령어도 사용할 수 있게 된다.

- `npm install [library_name]` : 일반 의존성 패키지 설치 (프로덕션용 의존성)
  - `npm i [library_name]`으로 줄여서 쓸 수도 있다.
- `npm install --save-dev [library_name]` : 개발 의존성 패키지 설치 (개발환경용 의존성)
  - `npm i -D [library_name]`으로 줄여서 쓸 수도 있다.
- `npm uninstall [library_name]` : 라이브러리 제거

라이브러리를 설치하면 아래 예시와 같이`package.json`에 설치한 라이브러리에 관한 정보들이 등록된다.

```json
// ...
"dependencies": {
		"next": "^13.0.6",
		"nextra": "latest",
		"nextra-theme-docs": "latest",
		"react": "^18.2.0",
		"react-dom": "^18.2.0"
  },
"devDependencies": {
		"@types/node": "18.11.10",
		"@types/react": "18.2.14",
		"typescript": "^4.9.3"
	}
// ...
```

그리고 동시에 `package-lock.json`이라는 파일과, `node_modules/`라는 디렉토리가 하나 만들어지는데, 간단한 라이브러리 하나를 설치하더라도 굉장히 많은 수의 라이브러리가 설치되어 `node_modules/` 하위에 다수의 디렉토리가 생성되는 것을 확인할 수 있다.

이것은 우리가 설치하고자하는 라이브러리, 예를 들어 React를 설치할 때 React가 동작하기 위해 의존하고 있는 여타 라이브러리들을 같이 설치하기 때문이다.
그리고 이 지점에서 `package.json`과 `package-lock.json` 파일의 역할을 구분할 수 있다.

- `package.json`: 프로젝트에 설치한 라이브러리 정보(이름, 버전)를 기록
- `package-lock.json`: package.json에서 설치한 라이브러리 및 해당 라이브러리가 의존하는 라이브러리 사이의 의존 관계 정보를 기록

그리고 라이브러리를 설치할 때 `global` 옵션을 줄 수 있는데(`npm i -g [library_name])`, 이렇게 설치하면 로컬 환경 내에서 전역적으로 해당 패키지를 사용할수 있게되는 장점이 있다. 물론 단점도 있는데, `package.json` 파일로 해당 패키지의 설치 정보를 기록할 수 없기 때문에 타 개발자와 협업 시 이 라이브러리에 대한 정보를 추가로 알려줘야한다는 점이다.

그래서 global 설치를 하면서 `package.json` 파일에 기록도 남기고 싶다면 devDependency로 설치하고 `npx` 명령어(Node Package Execution)로 실행하면 가능하긴 하지만, 개인 프로젝트가 아니라면 global 설치는 지양하자.

### 5.3 패키지 버전 이해하기

노드 생태계의 패키지 버전은 모두 3개의 숫자로 관리되고 있다.

> (Major).(Minor).(Patch)

이렇게 세 자리 숫자로 관리하는 방식을 SemVer(Semantic Versioning, 유의적 버저닝)이라고 부른다.

- Major: 하위 호환이 되지 않는 변경 사항
- Minor: 하위 호환이 되는 변경 사항
- Patch: 간단한 버그 수정

패키지의 사용자들에게 업데이트에 관한 대응을 미리 생각해볼 수 있도록 하는 장치인 것이다. SemVer 방식의 버전은 `package.json`에서 확인할 수 있고, 여기서는 특수한 표기법을 통해 추후 해당 라이브러리의 버전 업데이트에 대해 어떻게 대응할 것인지 미리 설정해볼 수 있다. 보통 `^(캐럿)`, `~(틸드)`, `>`, `<`, `=`, `>=`, `<=`의 기호를 사용한다.

가장 많이 사용하는 것은 캐럿이다. 이는 업데이트 시 마이너 버전까지만 설치하겠다는 것을 의미하고, 마이너 버전은 하위 버전들과 호환이 되기 때문에 가장 안정적으로 동작한다.

추가로 `@next`, `@latest`의 접미사를 붙이기도 하는데, 각각 최근의 배포판, 안정된 최신 배포판을 설치한다. `@next`는 안정되지 않은 배포판 또한 설치할 수 있어서 사용에 유의하자.

### 5.4 기타 npm 명령어

npm cli에서 사용할 수 있는 기타 명령어들에 대해서도 알아보자.

- `npm outdated`: 업데이트할 수 있는 패키지가 있는지 확인
- `npm uninstall [패키지명]` 또는 `npm rm [패키지명]`: 설치한 패키지 제거
- `npm search [검색어]`: npm의 패키지 검색
- `npm info [패키지명]`: 패키지 세부 정보 출력
- `npm adduser` 또는 `npm login`: npm에 로그인
- `npm whoami`: 로그인한 사용자 정보
- `npm logout`: npm에서 로그아웃
- `npm version`: `package.json`의 버전을 올림
- `npm deprecate [패키지명][버전] [메시지]`: 해당 버전의 패키지를 설치할 때 경고 메시지를 띄우도록 설정
- `npm publish`: 패키지 배포
- `npm unpublish`: 패키지 배포 중단(배포 후 24시간 이내에만 가능)

### 5.5 패키지 배포하기

npm 패키지를 배포하는 방법에 대해 알아보자.
우선 `npm init`을 통해 `package.json`을 하나 생성해주고,

```json
{
  "name": "sscoderati-intro",
  "version": "1.0.0",
  "description": "simply return my nickname",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "author": "sscoderati",
  "license": "MIT"
}
```

index.js에 다음과 같이 간단한 문자열을 반환하는 모듈을 만들어준다.

```js
module.exports = () => {
  return "My name is sscoderati.";
};
```

그리고 npm에 로그인 해야한다. 계정이 없으면 가입해주자.
![npm_로그인](https://github.com/sscoderati/cheshier-docs/assets/69716992/bff8ced6-6c34-4c5b-8b91-e47bfcc103c2)
그리고 `npm publish` 커맨드를 입력해주면...
![npm_배포](https://github.com/sscoderati/cheshier-docs/assets/69716992/e9eea4b4-f1f0-4511-a0c4-daad21e1b55b)
이렇게 배포가 잘 되고, `npm search`, `npm info` 등의 커맨드로 검색이 가능해진다.
물론 npm 웹 사이트에서도 검색이 된다.
![npm_search_info](https://github.com/sscoderati/cheshier-docs/assets/69716992/b961a250-c11c-4b88-8bd4-6cc8bfb58a19)
![npm_website_search](https://github.com/sscoderati/cheshier-docs/assets/69716992/51bfbb85-9c15-415f-a6b6-15c59f85802c)

하지만 npm에 이렇게 무분별하게 무의미한 패키지를 올리는 것은 지양해야하므로, 다시 배포를 중단해보자. `npm unpublish --force` 명령어를 사용하면 된다.
