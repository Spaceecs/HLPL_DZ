# MiniShop API

REST API інтернет-магазину на **NestJS + PostgreSQL + Redis**.

## Студент

|            |                                      |
| ---------- | ------------------------------------ |
| **ПІБ**    | Боцяновський Олександр Олександрович |
| **Група**  | 232/2 он                             |
| **Проєкт** | MiniShop API — фінальний проєкт      |

---

## Технології

- **NestJS** + TypeScript
- **PostgreSQL** + TypeORM (міграції, QueryBuilder)
- **Redis** — кешування з інвалідацією
- **JWT** автентифікація + **RBAC** авторизація
- **class-validator** + **class-transformer**
- **Swagger / OpenAPI**

---

## Запуск проєкту

```bash
cp .env.example .env
docker compose up --build
docker compose run --rm app npm run seed
```

Після запуску Swagger UI буде доступний за адресою:

```
http://localhost:3000/api/docs
```

---

## API Endpoints

### Auth

| Method | URL              | Auth | Опис        |
| ------ | ---------------- | ---- | ----------- |
| POST   | `/auth/register` | –    | Реєстрація  |
| POST   | `/auth/login`    | –    | Логін → JWT |

### Categories

| Method | URL                   | Auth  | Опис           |
| ------ | --------------------- | ----- | -------------- |
| GET    | `/api/categories`     | –     | Список         |
| GET    | `/api/categories/:id` | –     | Одна категорія |
| POST   | `/api/categories`     | admin | Створити       |
| PATCH  | `/api/categories/:id` | admin | Оновити        |
| DELETE | `/api/categories/:id` | admin | Видалити       |

### Products

| Method | URL                 | Auth  | Опис                         |
| ------ | ------------------- | ----- | ---------------------------- |
| GET    | `/api/products`     | –     | Список + pagination + filter |
| GET    | `/api/products/:id` | –     | Один продукт                 |
| POST   | `/api/products`     | admin | Створити                     |
| PATCH  | `/api/products/:id` | admin | Оновити                      |
| DELETE | `/api/products/:id` | admin | Видалити                     |

### Orders

| Method | URL                      | Auth  | Опис                         |
| ------ | ------------------------ | ----- | ---------------------------- |
| POST   | `/api/orders`            | user  | Створити замовлення          |
| GET    | `/api/orders`            | user  | Мої замовлення / всі (admin) |
| GET    | `/api/orders/:id`        | user  | Одне замовлення (ownership)  |
| PATCH  | `/api/orders/:id/status` | admin | Змінити статус               |
| DELETE | `/api/orders/:id`        | admin | Видалити                     |

---

## Приклади тестових запитів

### Створення замовлення — успіх (201)

```json
{
  "data": {
    "id": 1,
    "userId": 2,
    "status": "pending",
    "totalPrice": "135.00",
    "items": [
      { "productId": 61, "quantity": 2, "price": "45.00" },
      { "productId": 58, "quantity": 1, "price": "39.00" }
    ],
    "createdAt": "2026-07-23T19:22:32.000Z"
  },
  "statusCode": 201,
  "timestamp": "2026-07-23T19:22:32.880Z"
}
```

### Перевірка ownership — заборонено (403)

```json
{
  "error": {
    "code": 403,
    "message": "Forbidden resource",
    "traceId": "c7f99269-0a86-4f5c-9fc7-c7b60364982b"
  },
  "timestamp": "2026-07-23T19:25:10.120Z"
}
```

### Зміна статусу замовлення (200)

```json
{
  "data": {
    "id": 1,
    "status": "processing",
    "updatedAt": "2026-07-23T19:28:40.500Z"
  },
  "statusCode": 200,
  "timestamp": "2026-07-23T19:28:40.550Z"
}
```

### Недостатньо товару на складі (400)

```json
{
  "error": {
    "code": 400,
    "message": "Insufficient stock for \"Blocked Product\": available 0, requested 2",
    "traceId": "b65778c8-dfca-4a24-a10f-fbafe8f83c58"
  },
  "timestamp": "2026-07-23T19:17:10.880Z"
}
```
