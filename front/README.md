Для развёртывания front-end, backend должен быть уже запущен
```
npm install
npm run start
```
или
```
docker build -t front .
docker run -it -v ${PWD}:/usr/src/app -v /usr/src/app/node_modules -p 3000:3000 --rm front
