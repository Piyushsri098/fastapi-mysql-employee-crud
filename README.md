# Employee Manager — FastAPI + MySQL + React

A minimal full-stack CRUD app: MySQL (Docker) → FastAPI (Swagger docs) → React (Vite) UI.

## Prerequisites
- Docker Desktop
- Python 3.11+
- Node.js 18+

## 1. Start MySQL

```bash
docker compose up -d
```

This starts MySQL on `localhost:3306` with:
- database: `employee_db`
- user: `appuser` / `apppass`
- root password: `rootpass`

Load the schema + 15 dummy employees:

```bash
docker exec -i employee_mysql mysql -uroot -prootpass employee_db < backend/seed.sql
```

## 2. Start the FastAPI backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate      # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env           # adjust if your DB creds differ
uvicorn main:app --reload
```

- API root: http://localhost:8000
- Swagger UI: http://localhost:8000/docs — try every endpoint here first
- **New Endpoints**: 
  - `GET /employees?skip=0&limit=50` — paginated employee list
  - `GET /employees/count` — total employee count
  - `GET/POST /employees` 
  - `GET/PUT/DELETE /employees/{id}`

## 3. Start the React frontend

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173 — list, add, and edit employees through the UI with pagination support.

## Project layout

```
employee-app/
├── docker-compose.yml       # MySQL container
├── backend/
│   ├── main.py               # FastAPI app + CRUD routes (IMPROVED)
│   ├── models.py             # SQLAlchemy Employee model (IMPROVED)
│   ├── schemas.py            # Pydantic request/response schemas
│   ├── database.py           # DB engine/session setup (IMPROVED)
│   ├── seed.sql              # Table + 15 dummy rows
│   └── requirements.txt
└── frontend/
    ├── src/
    │   ├── App.jsx            # List / Add / Edit / Delete UI (IMPROVED)
    │   ├── api.js             # Axios client -> FastAPI (IMPROVED)
    │   └── main.jsx
    └── package.json
```

## Troubleshooting
- **React can't reach the API / CORS error**: confirm FastAPI is running on :8000 and the frontend origin (`http://localhost:5173`) is in `main.py`'s `allow_origins`.
- **FastAPI can't connect to MySQL**: confirm `docker compose ps` shows the container healthy, and `.env`'s `DATABASE_URL` matches the compose credentials.
- **Port already in use**: change the port mapping in `docker-compose.yml` (left side of `3306:3306`) or the `uvicorn --port` / Vite `server.port`.

## Performance Improvements (NEW!)

This version includes significant performance enhancements:

### Backend Performance
- ✅ **Connection Pooling**: Added pool_size=20, max_overflow=10 for efficient connection reuse
- ✅ **Database Indexes**: Added indexes on email, department, and hire_date fields
- ✅ **Session Management**: Fixed session leaks using FastAPI dependency injection
- ✅ **Pagination**: GET /employees now supports skip/limit parameters (50 per page default)
- ✅ **Error Handling**: Proper error codes (409 for duplicate emails, 500 for server errors)

### Frontend Performance
- ✅ **Optimistic Updates**: UI updates immediately, reverts on error
- ✅ **Request Deduplication**: Prevents duplicate requests if user clicks rapidly
- ✅ **Pagination UI**: Previous/Next navigation, total count display
- ✅ **Loading States**: Better UX with "Saving..." and "Deleting..." indicators
- ✅ **Button Disabling**: Prevents accidental double submissions

### Migration from Old Version
If you're updating from the previous version:
1. The API now requires pagination parameters for `/employees` endpoint
2. Frontend automatically handles pagination with Previous/Next buttons
3. All existing CRUD operations remain compatible
4. No database schema changes required

## Next steps (optional)
- Add filtering/search to `/employees?search=john`
- Add sorting options (by salary, hire_date, etc.)
- Add a delete-confirmation modal instead of `confirm()`
- Add authentication and role-based access control
- Add request caching with Redis
