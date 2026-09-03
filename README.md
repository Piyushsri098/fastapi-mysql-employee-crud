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
- Endpoints: `GET/POST /employees`, `GET/PUT/DELETE /employees/{id}`

## 3. Start the React frontend

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173 — list, add, and edit employees through the UI.

## Project layout

```
employee-app/
├── docker-compose.yml       # MySQL container
├── backend/
│   ├── main.py               # FastAPI app + CRUD routes
│   ├── models.py             # SQLAlchemy Employee model
│   ├── schemas.py            # Pydantic request/response schemas
│   ├── database.py           # DB engine/session setup
│   ├── seed.sql              # Table + 15 dummy rows
│   └── requirements.txt
└── frontend/
    ├── src/
    │   ├── App.jsx            # List / Add / Edit / Delete UI
    │   ├── api.js             # Axios client -> FastAPI
    │   └── main.jsx
    └── package.json
```

## Troubleshooting
- **React can't reach the API / CORS error**: confirm FastAPI is running on :8000 and the frontend origin (`http://localhost:5173`) is in `main.py`'s `allow_origins`.
- **FastAPI can't connect to MySQL**: confirm `docker compose ps` shows the container healthy, and `.env`'s `DATABASE_URL` matches the compose credentials.
- **Port already in use**: change the port mapping in `docker-compose.yml` (left side of `3306:3306`) or the `uvicorn --port` / Vite `server.port`.

## Next steps (optional)
- Add a Dockerfile for the backend and frontend so `docker compose up` runs everything, not just MySQL.
- Add pagination/search to `/employees`.
- Add a delete-confirmation modal instead of `confirm()`.
