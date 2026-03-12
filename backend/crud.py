from sqlalchemy.orm import Session
from typing import Optional
import models, schemas, auth

def get_user_by_username(db: Session, username: str):
    return db.query(models.User).filter(models.User.username == username).first()

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def create_user(db: Session, user: schemas.UserCreate):
    hashed_pw = auth.hash_password(user.password)
    db_user = models.User(
        username=user.username,
        email=user.email,
        hashed_password=hashed_pw,
        full_name=user.full_name
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def authenticate_user(db: Session, username: str, password: str):
    user = get_user_by_username(db, username)
    if not user:
        return None
    if not auth.verify_password(password, user.hashed_password):
        return None
    return user

def get_tasks(db: Session, user_id: int, status: Optional[str] = None, priority: Optional[str] = None):
    query = db.query(models.Task).filter(models.Task.user_id == user_id)
    if status:
        query = query.filter(models.Task.status == status)
    if priority:
        query = query.filter(models.Task.priority == priority)
    return query.order_by(models.Task.created_at.desc()).all()

def get_task(db: Session, task_id: int, user_id: int):
    return db.query(models.Task).filter(
        models.Task.id == task_id,
        models.Task.user_id == user_id
    ).first()

def create_task(db: Session, task: schemas.TaskCreate, user_id: int):
    db_task = models.Task(**task.model_dump(), user_id=user_id)
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task

def update_task(db: Session, task_id: int, task_update: schemas.TaskUpdate, user_id: int):
    task = get_task(db, task_id, user_id)
    if not task:
        return None
    update_data = task_update.model_dump(exclude_unset=True)
    for key, val in update_data.items():
        setattr(task, key, val)
    db.commit()
    db.refresh(task)
    return task

def delete_task(db: Session, task_id: int, user_id: int):
    task = get_task(db, task_id, user_id)
    if not task:
        return False
    db.delete(task)
    db.commit()
    return True

def get_task_stats(db: Session, user_id: int):
    tasks = db.query(models.Task).filter(models.Task.user_id == user_id).all()
    return {
        "total": len(tasks),
        "todo": sum(1 for t in tasks if t.status == "todo"),
        "in_progress": sum(1 for t in tasks if t.status == "in_progress"),
        "completed": sum(1 for t in tasks if t.status == "completed"),
        "high_priority": sum(1 for t in tasks if t.priority == "high"),
    }