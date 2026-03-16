# TaskManager — Full Stack Application

A clean, minimal Task Manager with user authentication, email verification, and persistent PostgreSQL database. Built with FastAPI + React + PostgreSQL.

---

## Live Demo

| What | URL |
|---|---|
| Live App | https://taskmanager-sandy-phi.vercel.app |
| Backend API | https://taskmanager-backend-6juz.onrender.com |
| API Docs | https://taskmanager-backend-6juz.onrender.com/docs |
| GitHub | https://github.com/SKsheema26/taskmanager |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | FastAPI, SQLAlchemy, PostgreSQL |
| Authentication | JWT tokens, werkzeug password hashing |
| Frontend | React 18, React Router v6, Axios |
| Styling | Pure CSS (DM Sans font) |
| Hosting | Render (backend) + Vercel (frontend) |
| Email | Resend API |

---

## Features

- User Authentication — Signup, Login, JWT tokens (24h expiry)
- Email Verification — verify email before login
- Tasks — Create, Edit, Delete, Quick status toggle
- Kanban Board — Three columns: To Do, In Progress, Completed
- Filtering — By status, priority, or free-text search
- Progress Tracking — Live progress bar and stat counters
- Due Dates — Overdue highlighting
- Priorities — High, Medium, Low with color coding
- Persistent Database — PostgreSQL on Render, data never lost
- Responsive — Works on desktop and tablet

---

## Project Structure
```
taskmanager/
├── backend/
│   ├── main.py          # FastAPI app + all routes
│   ├── models.py        # SQLAlchemy ORM models (User, Task)
│   ├── schemas.py       # Pydantic request/response schemas
│   ├── crud.py          # Database operations
│   ├── auth.py          # JWT + werkzeug password hashing + email
│   ├── database.py      # PostgreSQL connection and session
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── client.js         # Axios API client
│   │   ├── context/
│   │   │   └── AuthContext.js    # Global auth state
│   │   ├── pages/
│   │   │   ├── LoginPage.js
│   │   │   ├── SignupPage.js
│   │   │   ├── DashboardPage.js
│   │   │   └── VerifyEmailPage.js
│   │   ├── components/
│   │   │   └── TaskModal.js
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

## API Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | /auth/signup | No | Register new user |
| POST | /auth/login | No | Login, get JWT token |
| GET | /auth/me | Yes | Get current user info |
| GET | /auth/verify-email | No | Verify email with token |
| POST | /auth/resend-verification | No | Resend verification email |
| GET | /tasks | Yes | List all tasks |
| POST | /tasks | Yes | Create a task |
| GET | /tasks/{id} | Yes | Get a single task |
| PUT | /tasks/{id} | Yes | Update a task |
| DELETE | /tasks/{id} | Yes | Delete a task |
| GET | /tasks/stats/summary | Yes | Get task statistics |
| GET | /admin/users | No | List all users |

---

## Local Development

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm start
```

### Environment Variables

#### Backend (Render)
```
SECRET_KEY        = your-secret-key
DATABASE_URL      = postgresql://user:password@host/dbname
RESEND_API_KEY    = re_your_resend_api_key
FRONTEND_URL      = https://taskmanager-sandy-phi.vercel.app
```

#### Frontend (Vercel)
```
REACT_APP_API_URL = https://taskmanager-backend-6juz.onrender.com
```

---

## Deployment

| Service | Platform | Notes |
|---|---|---|
| Backend | Render.com free tier | Sleeps after 15min inactivity |
| Frontend | Vercel.com free tier | Always on |
| Database | Render PostgreSQL free | Persistent storage |
| Email | Resend.com free tier | 100 emails/day |

### Keep Backend Awake
Use UptimeRobot to ping the backend every 5 minutes:
```
https://uptimerobot.com
Monitor URL: https://taskmanager-backend-6juz.onrender.com/docs
Interval: 5 minutes
```

---

## Security

- Passwords hashed with PBKDF2-SHA256 via werkzeug
- JWT tokens expire after 24 hours
- Email verification required before login
- Each user can only access their own tasks
- SECRET_KEY stored as environment variable, never in code
