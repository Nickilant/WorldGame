# BlockCity Empire MVP Starter

## 1) MongoDB deployment (чтобы убрать `ECONNREFUSED 127.0.0.1:27017`)

### Option A — Docker (рекомендуется)
```bash
docker run -d --name blockcity-mongo \
  -p 27017:27017 \
  -e MONGO_INITDB_DATABASE=blockcity \
  mongo:7
```

Проверка:
```bash
docker ps
docker logs blockcity-mongo --tail 20
```

### Option B — локально через пакетный менеджер (Ubuntu)
```bash
sudo apt-get update
sudo apt-get install -y mongodb
sudo systemctl enable mongodb
sudo systemctl start mongodb
```

## 2) Backend
```bash
cd backend
npm install
MONGO_URI=mongodb://127.0.0.1:27017/blockcity JWT_SECRET=dev-secret npm run dev
```

## 3) Frontend
```bash
cd frontend
npm install
VITE_API_URL=http://localhost:4000 VITE_SOCKET_URL=http://localhost:4000 npm run dev
```

## 4) Current flow
- На старте показывается экран **регистрации/авторизации**.
- После регистрации открывается **создание персонажа**.
- После логина сразу происходит вход в мир.
- В мире:
  - маленький персонаж;
  - камера фиксирована (без вращения/зума), двигается только по плоскости;
  - меню по кнопке (не закреплено всегда слева);
  - старт без зданий;
  - есть земля и небо.
