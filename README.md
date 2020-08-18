# auth-server

프로젝트에 사용하는 모든 인증을 대신해주는 JWT 기반 인증서버.


## install
node version : v12.18.3

```
npm install
```


## Redis

```
docker run -d -p 6379:6379 --name redis redis
```


## dotenv
https://www.notion.so/d2b21f96934649a082639482b5c0a731 에서 다운로드받아서 루트 디렉토리아래에 위치


## runserver

run server.js :  npm run dev

run authServer.js :  npn run devAuth  


## Test
requests.rest 활용
