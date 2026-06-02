## Student
- Name: Боцяновський Олександр Олександрович
- Group: 232/2 он
 
## Практичне заняття №2 — NestJS + PostgreSQL + Redis
 
## Структура репозиторію
```
.
├── src/              	# NestJS source code
├── Dockerfile
├── docker-compose.yml
├── .env.example      	# шаблон змінних оточення
└── README.md
```
 
## Запуск проекту
```bash
cp .env.example .env   # налаштувати значення
docker compose up --build
```
 
## Перевірка сервісів
```text
NAME                 IMAGE                COMMAND                  SERVICE    CREATED         STATUS                   PORTS
hlpl_dz-app-1        hlpl_dz-app          "docker-entrypoint.s…"   app        9 minutes ago   Up 9 minutes             0.0.0.0:3000->3000/tcp, [::]:3000->3000/tcp
hlpl_dz-postgres-1   postgres:16-alpine   "docker-entrypoint.s…"   postgres   9 minutes ago   Up 9 minutes (healthy)   0.0.0.0:5432->5432/tcp, [::]:5432->5432/tcp
hlpl_dz-redis-1      redis:7-alpine       "docker-entrypoint.s…"   redis      9 minutes ago   Up 9 minutes (healthy)   0.0.0.0:6379->6379/tcp, [::]:6379->6379/tcp
```
 
## Перевірка PostgreSQL
```text
                                                      List of databases
   Name    |  Owner   | Encoding | Locale Provider |  Collate   |   Ctype    | ICU Locale | ICU Rules |   Access privileges   
-----------+----------+----------+-----------------+------------+------------+------------+-----------+-----------------------
 nestdb    | nestuser | UTF8     | libc            | en_US.utf8 | en_US.utf8 |            |           | 
 postgres  | nestuser | UTF8     | libc            | en_US.utf8 | en_US.utf8 |            |           | 
 template0 | nestuser | UTF8     | libc            | en_US.utf8 | en_US.utf8 |            |           | =c/nestuser          +
           |          |          |                 |            |            |            |           | nestuser=CTc/nestuser
 template1 | nestuser | UTF8     | libc            | en_US.utf8 | en_US.utf8 |            |           | =c/nestuser          +
           |          |          |                 |            |            |            |           | nestuser=CTc/nestuser
(4 rows)

```
 
## Перевірка Redis
```text
PONG
```
 
## Перевірка застосунку
```text
Hello World!%   
```
 
## Логи NestJS (фрагмент)
```text
[9:46:50 AM] Starting compilation in watch mode...
app-1  | 
app-1  | [9:46:52 AM] Found 0 errors. Watching for file changes.
app-1  | 
app-1  | [Nest] 29  - 06/02/2026, 9:46:53 AM     LOG [NestFactory] Starting Nest application...
app-1  | [Nest] 29  - 06/02/2026, 9:46:53 AM     LOG [InstanceLoader] TypeOrmModule dependencies initialized +52ms
app-1  | [Nest] 29  - 06/02/2026, 9:46:53 AM     LOG [InstanceLoader] ConfigHostModule dependencies initialized +0ms
app-1  | [Nest] 29  - 06/02/2026, 9:46:53 AM     LOG [InstanceLoader] AppModule dependencies initialized +0ms
app-1  | [Nest] 29  - 06/02/2026, 9:46:53 AM     LOG [InstanceLoader] ConfigModule dependencies initialized +1ms
app-1  | [Nest] 29  - 06/02/2026, 9:46:53 AM     LOG [InstanceLoader] CacheModule dependencies initialized +6ms
app-1  | [Nest] 29  - 06/02/2026, 9:46:53 AM     LOG [InstanceLoader] TypeOrmCoreModule dependencies initialized +38ms
app-1  | [Nest] 29  - 06/02/2026, 9:46:53 AM     LOG [RoutesResolver] AppController {/}: +4ms
app-1  | [Nest] 29  - 06/02/2026, 9:46:53 AM     LOG [RouterExplorer] Mapped {/, GET} route +3ms
app-1  | [Nest] 29  - 06/02/2026, 9:46:53 AM     LOG [NestApplication] Nest application successfully started +2ms
```
