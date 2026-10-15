# Taskline

A responsive task workspace built with **React, Node.js, Express, Sequelize and MySQL**. An ink-colored navigation rail, sage accents, a desktop table and mobile cards keep the interface focused on the work.

**Assignment substitution:** The supplied assignment asks for Laravel. This implementation deliberately uses Node.js at the candidate's request while retaining the task fields, five CRUD routes and frontend capabilities. Employer acceptance of that substitution is not assumed.

## Included

- Create, list, edit and permanently delete tasks with confirmation.
- Status updates and filters: **Pending**, **In Progress**, **Completed**.
- Required title, optional description and optional calendar due date.
- Inline forms, field validation, loading skeletons and success/error feedback.
- MySQL persistence through Sequelize and an explicit migration.
- Keyboard focus handling, native controls and reduced-motion support.
- Optional illustrative demo records; no sample data is inserted automatically.

## Project layout

```text
task-management/
  backend/          Express API, Sequelize model and migration
  frontend/         React application and design tokens
  README.md         Installation and API usage
  plan.md           HLD, LLD, UI direction and implementation roadmap
  PRODUCT.md        Product scope
  DESIGN.md         Taskline visual system
  compose.yaml      Optional local MySQL 8.4 container
  .env.example      Placeholder Docker configuration
  .gitignore
```

## Prerequisites

- Node.js **24 LTS** with npm.
- MySQL **8.4** recommended; schema uses MySQL 8.0-compatible types/collation.
- Git, if working from a repository.
- Docker Desktop / Docker Compose only if using the optional container setup.

Use the committed lockfiles with `npm ci` inside each application. No global Express, Vite or Sequelize CLI installation is required.

## 1. Start MySQL

Choose either an existing MySQL installation or the optional Docker container.

### Option A — Existing MySQL

Start the MySQL service. In MySQL Workbench or the MySQL CLI, run this as a local administrator, replacing the placeholder password:

```sql
CREATE DATABASE task_management
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_0900_as_cs;

CREATE USER 'taskline'@'localhost'
  IDENTIFIED BY 'replace_with_your_local_password';

GRANT ALL PRIVILEGES ON task_management.*
  TO 'taskline'@'localhost';
```

These grants keep local setup simple and let the same local account run migrations. For a hosted environment, use a separate migration account for DDL and limit the running application's account to SELECT, INSERT, UPDATE and DELETE. Do not use the MySQL root account as the application user.

If the database/user already exists, use it and update its grants/password through your administrator rather than blindly repeating CREATE statements.



From the repository root, copy the root example:

```powershell
# Windows PowerShell
Copy-Item .env.example .env
```

```bash
# Linux/macOS
cp .env.example .env
```

Edit the root `.env` and choose real local values for `MYSQL_ROOT_PASSWORD` and `DB_PASSWORD`. Then run:





This creates the `task_management` database and `taskline` user. Put the same `DB_PASSWORD` in `backend/.env` below. MySQL listens only on local port 3306. If another MySQL service uses that port, use Option A or change the Compose port mapping and backend `DB_PORT` together.

MySQL data is held in a named volume. `docker compose down` stops the container while retaining data. Avoid deleting the volume unless you intend to erase the database. Changing environment passwords after the volume is initialized does not change existing MySQL user passwords; update them through MySQL.

## 2. Configure and start the backend

Open a terminal at the repository root:

```bash
cd backend
npm ci
```

Copy the backend configuration:

```powershell
# Windows PowerShell
Copy-Item .env.example .env
```

```bash
# Linux/macOS
cp .env.example .env
```

Edit `backend/.env`:

```dotenv
NODE_ENV=development
HOST=127.0.0.1
PORT=3000
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=task_management
DB_USER=taskline
DB_PASSWORD=replace_with_your_local_password
FRONTEND_ORIGIN=http://localhost:5173
```

Use the password you configured in MySQL. The example contains no real credentials. Then run:

```bash
npm run db:migrate
npm run dev
```

The API starts at **http://127.0.0.1:3000** only after the database connection succeeds. Keep this terminal running. The server never automatically creates, drops or synchronizes tables.

Optional demo data, from a separate terminal inside `backend/`:

```bash
npm run db:seed
```

This adds six clearly illustrative task records only when no tasks exist. It does not clear data, and it is not needed for normal use. Do not run concurrent seed commands.

## 3. Start the frontend

Open another terminal at the repository root:

```bash
cd frontend
npm ci
npm run dev
```

Open **http://localhost:5173**. The frontend uses `/api`, and the development server proxies those requests to `127.0.0.1:3000`.

`frontend/.env.example` is optional because `/api` is the built-in default. For a deliberately separate API origin, copy it to `.env`, set `VITE_API_BASE_URL` to a public API base such as `https://your-api.example/api`, configure the backend's `FRONTEND_ORIGIN`, and restart Vite. Never place credentials in `VITE_*` variables.

If changing the backend port, also update the proxy target in `frontend/vite.config.js`. Port 5173 uses strict-port mode so a different automatic port cannot silently break the configured frontend origin.

## Production frontend build

Inside `frontend/`:

```bash
npm run build
```

This writes `frontend/dist`. A deployment must serve that output and route `/api` to the Node process, or build with an explicit public API URL. `vite preview` serves static build output; it is not the Node API or a replacement for an API reverse proxy.

Run the backend with `npm start` for a process without the development watcher. Public hosting is outside this local setup; the current shared collection has no authentication.

## API

Base URL: **http://127.0.0.1:3000/api**

| Method | Endpoint     | Behavior                               |
| ------ | ------------ | -------------------------------------- |
| GET    | `/tasks`     | All tasks, newest ID first             |
| POST   | `/tasks`     | Create task; returns 201 and Location  |
| GET    | `/tasks/:id` | One task                               |
| PUT    | `/tasks/:id` | Update all editable fields             |
| DELETE | `/tasks/:id` | Permanently delete; returns deleted ID |

POST and PUT use `Content-Type: application/json`.

### Create

```json
{
  "title": "Prepare assignment README",
  "description": "Document startup and database setup.",
  "status": "Pending",
  "due_date": "2026-10-20"
}
```

Only title is required on POST. The default status is Pending, and omitted optional values become null. Title must be nonblank and at most 255 JavaScript string units after trimming. Description is limited to 5,000 units. Unknown fields are rejected.

### Full update

```json
{
  "title": "Prepare assignment README",
  "description": null,
  "status": "Completed",
  "due_date": null
}
```

PUT requires **all four editable keys**. Use null to clear description or due date. Do not send id, created_at or updated_at. Quick status changes in the UI use this same full PUT contract and preserve the other fields.

Due dates are valid YYYY-MM-DD calendar dates, not timestamps; supported range is 1000-01-01 through 9999-12-31. Past dates are allowed. All statuses can transition to any other status. Duplicate titles are allowed.

### Optional list queries

```text
/api/tasks?status=In%20Progress
/api/tasks?page=1&pageSize=20
/api/tasks?status=Completed&page=1&pageSize=10
```

Bare GET returns all tasks, without a hidden default limit. Pagination is enabled only if page/pageSize is supplied; defaults for an omitted counterpart are 1 and 20. Maximum pageSize is 100. Query names and statuses are strict; unknown/repeated values are rejected. The UI fetches all tasks and filters that collection locally to keep navigation counts accurate.

### Response shape

```json
{
  "success": true,
  "message": "Task created successfully.",
  "data": {
    "id": 1,
    "title": "Prepare assignment README",
    "description": null,
    "status": "Pending",
    "due_date": null,
    "created_at": "2026-10-16T00:00:00.000Z",
    "updated_at": "2026-10-16T00:00:00.000Z"
  }
}
```

Lists use a data array and add meta with total, page, pageSize and totalPages. Pagination values are null when absent. Deletion returns a success envelope with `data: {"id": 1}`. A repeated deletion returns 404.

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Please correct the highlighted fields.",
    "fields": { "title": ["Task title is required."] }
  }
}
```

HTTP failures use 400 for invalid JSON/ID, 404 for missing records/routes, 413 for oversized input, 415 for wrong content type, 422 for validation, 500 for internal failures and 503 for a recognized unavailable database. API errors never include SQL or credentials. X-Request-Id correlates a response with redacted server logs.

## Behavior and limitations

- One shared task collection. No login, users, permissions or tenant features were requested.
- Deletion is permanent after confirmation.
- Concurrent editors use last successful write wins; database row locks do not detect stale forms.
- Writes are not automatically retried. A timeout may happen after a change was saved, so the UI requires refresh before another write when the outcome is unknown.
- A confirmed write remains successful even if its subsequent list refresh fails.
- Large collections can use optional API pagination; the assignment UI intentionally loads the complete collection.
- Dates are stored as MySQL DATE and displayed without converting them to UTC timestamps.

## Troubleshooting

| Symptom                              | Action                                                                             |
| ------------------------------------ | ---------------------------------------------------------------------------------- |
| Invalid configuration                | Copy backend/.env.example and fill in every database value                         |
| Database startup failed              | Start MySQL; check host, port, database, credentials and matching account host     |
| Missing tasks table                  | Run npm run db:migrate inside backend                                              |
| Migration permission denied          | Use a database-scoped account allowed to run DDL                                   |
| Frontend connection screen           | Keep the API running at port 3000; check the Vite proxy                            |
| Port in use                          | Stop the conflicting process or update the relevant configuration together         |
| Case-related import error            | Preserve exact file/import casing, including TaskList.jsx                          |
| Date rejected                        | Use a real YYYY-MM-DD calendar date or null                                        |
| PUT validation error                 | Send all four editable keys, not just status                                       |
| Docker password change has no effect | Existing database volumes retain their user accounts; change the password in MySQL |

## Git and submission

Keep one repository at this root. Both backend and frontend source, migrations, lockfiles and README belong in it. `.env`, dependency folders, database data and generated builds do not. Meaningful local commits separate setup, API and UI work.

Before submission, push to your chosen GitHub repository and fill in your **Candidate Name**, the real **GitHub Repository URL** and the actual **Completion Date**. No repository URL is invented or email sent by this source package. Disclose the backend stack substitution clearly.

## Implementation checks

The production React build succeeded. The migration, five HTTP CRUD routes, status filter, optional pagination, invalid-date response and demo seed were exercised directly with MySQL 8.0.46 and Node 24.19.0. The recommended Docker MySQL 8.4 configuration is supplied for local setup. Production dependency audits reported no known vulnerabilities at this check. The Sequelize UUID override pins a CommonJS-compatible patched version used by its transaction IDs.

Impeccable’s mechanical scan reported no flagged patterns. Browser screenshot, responsive rendering and interactive accessibility inspection were unavailable in this execution environment, so those visual checks are not claimed complete.
