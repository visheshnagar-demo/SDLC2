from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from server.crud import create_task, delete_task, get_task_by_id, get_tasks, update_task
from server.database import get_db
from server.schemas import TaskCreateRequest, TaskResponse, TaskUpdateRequest

router = APIRouter(prefix="/api/v1/tasks", tags=["tasks"])


@router.get("", response_model=List[TaskResponse], status_code=status.HTTP_200_OK)
def read_tasks(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    completed: Optional[bool] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    tasks = get_tasks(db, skip=skip, limit=limit, completed=completed, search=search)
    return tasks


@router.post("", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
def create_new_task(
    task_in: TaskCreateRequest,
    db: Session = Depends(get_db),
):
    task = create_task(db, task_in)
    return task


@router.get("/{task_id}", response_model=TaskResponse, status_code=status.HTTP_200_OK)
def read_task(
    task_id: str,
    db: Session = Depends(get_db),
):
    task = get_task_by_id(db, task_id)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Task with ID {task_id} not found",
        )
    return task


@router.patch("/{task_id}", response_model=TaskResponse, status_code=status.HTTP_200_OK)
def patch_task(
    task_id: str,
    task_in: TaskUpdateRequest,
    db: Session = Depends(get_db),
):
    task = get_task_by_id(db, task_id)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Task with ID {task_id} not found",
        )
    return update_task(db, task, task_in)


@router.put("/{task_id}", response_model=TaskResponse, status_code=status.HTTP_200_OK)
def put_task(
    task_id: str,
    task_in: TaskUpdateRequest,
    db: Session = Depends(get_db),
):
    task = get_task_by_id(db, task_id)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Task with ID {task_id} not found",
        )
    return update_task(db, task, task_in)


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_task(
    task_id: str,
    db: Session = Depends(get_db),
):
    task = get_task_by_id(db, task_id)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Task with ID {task_id} not found",
        )
    delete_task(db, task)
    return None
