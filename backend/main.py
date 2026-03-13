from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import Optional, List
import models, schemas, crud, auth
from database import SessionLocal, engine

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Task Manager API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    payload = auth.decode_token(token)
    if payload is None:
        raise credentials_exception
    username: str = payload.get("sub")
    if username is None:
        raise credentials_exception
    user = crud.get_user_by_username(db, username=username)
    if user is None:
        raise credentials_exception
    return user

# ─── AUTH ROUTES ─────────────────────────────────────────────────────────────

@app.post("/auth/signup", response_model=schemas.UserOut, status_code=201)
def signup(user: schemas.UserCreate, db: Session = Depends(get_db)):
    if crud.get_user_by_username(db, user.username):
        raise HTTPException(status_code=400, detail="Username already taken")
    if crud.get_user_by_email(db, user.email):
        raise HTTPException(status_code=400, detail="Email already registered")
    token = auth.generate_verification_token()
    new_user = crud.create_user(db, user, verification_token=token)
    auth.send_verification_email(new_user.email, new_user.username, token)
    return new_user

@app.get("/auth/verify-email")
def verify_email(token: str, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(
        models.User.verification_token == token
    ).first()
    if not user:
        raise HTTPException(status_code=400, detail="Invalid or expired token")
    user.is_active = True
    user.verification_token = None
    db.commit()
    return {"message": "Email verified successfully! You can now login."}

@app.post("/auth/resend-verification")
def resend_verification(email: str, db: Session = Depends(get_db)):
    user = crud.get_user_by_email(db, email)
    if not user:
        raise HTTPException(status_code=404, detail="Email not found")
    if user.is_active:
        raise HTTPException(status_code=400, detail="Email already verified")
    token = auth.generate_verification_token()
    user.verification_token = token
    db.commit()
    auth.send_verification_email(user.email, user.username, token)
    return {"message": "Verification email resent"}

@app.post("/auth/login", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = crud.authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Please verify your email before logging in",
        )
    access_token = auth.create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer", "user": user}

@app.get("/auth/me", response_model=schemas.UserOut)
def get_me(current_user=Depends(get_current_user)):
    return current_user

# ─── TASK ROUTES ─────────────────────────────────────────────────────────────

@app.get("/tasks", response_model=List[schemas.TaskOut])
def get_tasks(
    status: Optional[str] = None,
    priority: Optional[str] = None,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return crud.get_tasks(db, user_id=current_user.id, status=status, priority=priority)

@app.post("/tasks", response_model=schemas.TaskOut, status_code=201)
def create_task(task: schemas.TaskCreate, current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    return crud.create_task(db, task, user_id=current_user.id)

@app.get("/tasks/stats/summary", response_model=schemas.TaskStats)
def get_stats(current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    return crud.get_task_stats(db, user_id=current_user.id)

@app.get("/tasks/{task_id}", response_model=schemas.TaskOut)
def get_task(task_id: int, current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    task = crud.get_task(db, task_id, user_id=current_user.id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task

@app.put("/tasks/{task_id}", response_model=schemas.TaskOut)
def update_task(task_id: int, task_update: schemas.TaskUpdate, current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    task = crud.update_task(db, task_id, task_update, user_id=current_user.id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task

@app.delete("/tasks/{task_id}", status_code=204)
def delete_task(task_id: int, current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    if not crud.delete_task(db, task_id, user_id=current_user.id):
        raise HTTPException(status_code=404, detail="Task not found")

# ─── ADMIN ROUTES ─────────────────────────────────────────────────────────────

@app.get("/admin/users")
def list_users(db: Session = Depends(get_db)):
    users = db.query(models.User).all()
    return [
        {
            "id": u.id,
            "username": u.username,
            "email": u.email,
            "is_active": u.is_active,
            "created_at": u.created_at
        }
        for u in users
    ]