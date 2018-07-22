Для развёртывания front-end, backend должен быть уже запущен
```
npm install
npm run start
```
или
```
docker run -it -v ${PWD}:/usr/src/app -v /usr/src/app/node_modules -p 3000:3000 --rm front
```
или
```
docker-compose up (-d --build)
```
