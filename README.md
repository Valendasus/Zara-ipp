# Практическая работа № 5 — телефонный справочник (CRUD APP)

**Цель:** разработать REST API и пользовательский интерфейс для управления контактами.

## Запуск

```bash
node -v
npm start
```

Откройте `http://localhost:3001` — интерфейс телефонного справочника. API доступен на `http://localhost:3001/api/contacts`. Зависимости npm не требуются (стандартные модули Node.js). Контакты сохраняются в `contacts.json`.

## Операции и ответы

| Операция | Запрос | Ответ |
|---|---|---|
| Список | GET /api/contacts | 200 + JSON-массив |
| Один контакт | GET /api/contacts/1 | 200 + объект / 404 |
| Создать | POST /api/contacts | 201 + объект / 400 |
| Изменить | PUT /api/contacts/1 | 200 + объект / 400 / 404 |
| Изменить частично | PATCH /api/contacts/1 | 200 + объект / 400 / 404 |
| Удалить | DELETE /api/contacts/1 | 204 без тела / 404 |

## Примеры curl

```bash
curl -i http://localhost:3001/api/contacts
curl -i -X POST http://localhost:3001/api/contacts -H 'Content-Type: application/json' -d '{"name":"Анна Смирнова","phone":"+79991234567","email":"anna@example.com"}'
curl -i -X PUT http://localhost:3001/api/contacts/1 -H 'Content-Type: application/json' -d '{"name":"Иван Петров","phone":"+79991112233","email":"ivan@example.com"}'
curl -i -X DELETE http://localhost:3001/api/contacts/2
```

## Тестирование

```bash
npm test
```

## Развёртывание на Render

Приложение публикуется на [Render](https://render.com) как Web Service (вместо Heroku из методички, у которого больше нет бесплатного тарифа). Настройки описаны в `render.yaml`:

- Runtime: **Node**
- Build Command: `npm install`
- Start Command: `npm start`
- Порт берётся из переменной окружения `PORT`, которую задаёт Render.

Ссылка на развёрнутое приложение: `https://<имя-сервиса>.onrender.com`

**Отличие от методички:** методичка предлагает MEAN (MongoDB/Express/AngularJS/Node.js) и публикацию на Heroku. Здесь реализован вариант на чистом Node.js с JSON-файлом и веб-интерфейсом, опубликованный на Render. На бесплатном тарифе Render файловая система временная: после перезапуска сервиса `contacts.json` возвращается к исходному состоянию.
