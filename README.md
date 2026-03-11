# ✓ TaskManager — Full Stack Application

A clean, minimal Task Manager with user authentication, built with **FastAPI** + **React** + **SQLite**.

---

## 🗂 Project Structure

```
taskmanager/
├── backend/
│   ├── main.py          # FastAPI app + all routes
│   ├── models.py        # SQLAlchemy ORM models (User, Task)
│   ├── schemas.py       # Pydantic request/response schemas
│   ├── crud.py          # Database operations
│   ├── auth.py          # JWT authentication + password hashing
│   ├── database.py      # SQLite connection & session
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── client.js       # Axios API client
│   │   ├── context/
│   │   │   └── AuthContext.js  # Global auth state
│   │   ├── pages/
│   │   │   ├── LoginPage.js
│   │   │   ├── SignupPage.js
│   │   │   └── DashboardPage.js
│   │   ├── components/
│   │   │   └── TaskModal.js    # Create/Edit modal
│   │   ├── App.js
│   │   ├── App.css
│   │   └── index.js
│   ├── public/index.html
│   ├── package.json
│   ├── Dockerfile
│   └── nginx.conf
└── docker-compose.yml
```

---

## 🚀 Quick Start

### Option A — Docker Compose (recommended)

```bash
docker-compose up --build
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

---

### Option B — Manual Setup

#### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

#### Frontend

```bash
cd frontend
npm install
npm start                         # Runs on http://localhost:3000
```

---

## 🔑 API Endpoints

| Method | Endpoint              | Auth? | Description               |
|--------|-----------------------|-------|---------------------------|
| POST   | /auth/signup          | No    | Register a new user       |
| POST   | /auth/login           | No    | Login, get JWT token      |
| GET    | /auth/me              | Yes   | Get current user info     |
| GET    | /tasks                | Yes   | List all tasks (filtered) |
| POST   | /tasks                | Yes   | Create a task             |
| GET    | /tasks/{id}           | Yes   | Get a single task         |
| PUT    | /tasks/{id}           | Yes   | Update a task             |
| DELETE | /tasks/{id}           | Yes   | Delete a task             |
| GET    | /tasks/stats/summary  | Yes   | Get task statistics       |

---

## ✨ Features

- **Authentication** — Signup, login, JWT tokens (24h expiry), auto-logout on 401
- **Tasks** — Create, edit, delete, quick status toggle
- **Kanban View** — Three-column board: To Do / In Progress / Completed
- **Filtering** — By status, priority, or free-text search
- **Progress Tracking** — Live progress bar + stat counters
- **Due Dates** — Overdue highlighting
- **Priorities** — High / Medium / Low with color coding
- **Responsive** — Works on desktop and tablet

---

## 🔐 Security Notes

- Passwords are hashed with **bcrypt** (passlib)
- JWT secret is in `auth.py` — **change `SECRET_KEY` in production**
- CORS is configured for `localhost:3000` — update for your production domain

---

## 🛠 Tech Stack

| Layer    | Technology                        |
|----------|-----------------------------------|
| Backend  | FastAPI, SQLAlchemy, SQLite       |
| Auth     | JWT (python-jose), bcrypt         |
| Frontend | React 18, React Router v6, Axios  |
| Styling  | Pure CSS (DM Sans font)           |
| Deploy   | Docker + Nginx                    |
