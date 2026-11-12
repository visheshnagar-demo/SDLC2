import uuid
from datetime import datetime, timezone
from typing import List, Optional
from sqlalchemy.orm import Session
from server.models import Task
from server.schemas import TaskCreateRequest, TaskUpdateRequest


def get_tasks(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    completed: Optional[bool] = None,
    search: Optional[str] = None,
) -> List[Task]:
    query = db.query(Task)
    if completed is not None:
        query = query.filter(Task.completed == completed)
    if search:
        query = query.filter(Task.title.ilike(f"%{search}%"))
    return query.order_by(Task.created_at.asc()).offset(skip).limit(limit).all()


def get_task_by_id(db: Session, task_id: str) -> Optional[Task]:
    return db.query(Task).filter(Task.id == task_id).first()


def create_task(db: Session, task_in: TaskCreateRequest) -> Task:
    now = datetime.now(timezone.utc)
    task = Task(
        id=str(uuid.uuid4()),
        title=task_in.title,
        completed=False,
        created_at=now,
        updated_at=now,
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


def update_task(db: Session, task: Task, task_in: TaskUpdateRequest) -> Task:
    if task_in.title is not None:
        task.title = task_in.title
    if task_in.completed is not None:
        task.completed = task_in.completed
    task.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(task)
    return task


def delete_task(db: Session, task: Task) -> None:
    db.delete(task)
    db.commit()
