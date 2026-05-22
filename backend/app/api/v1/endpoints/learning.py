from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.schemas.learning import Course
from app.models.learning import Course as CourseModel, UserProgress as ProgressModel
from app.models.user import User as UserModel
from app.core import deps
from app.db.session import get_db

router = APIRouter()

@router.get("/courses", response_model=List[Course])
def read_courses(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    courses = db.query(CourseModel).offset(skip).limit(limit).all()
    return courses

@router.get("/courses/{id}", response_model=Course)
def read_course_by_id(
    id: int,
    db: Session = Depends(get_db),
) -> Any:
    course = db.query(CourseModel).filter(CourseModel.id == id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return course

@router.post("/quiz/submit")
def submit_quiz(
    *,
    db: Session = Depends(get_db),
    course_id: int,
    score: int,
    current_user: UserModel = Depends(deps.get_current_user),
) -> Any:
    progress = db.query(ProgressModel).filter(
        ProgressModel.user_id == current_user.id,
        ProgressModel.course_id == course_id
    ).first()
    
    if not progress:
        progress = ProgressModel(
            user_id=current_user.id,
            course_id=course_id,
            progress_percentage=100.0,
            score=score
        )
        db.add(progress)
    else:
        progress.score = max(progress.score, score)
        progress.progress_percentage = 100.0
    
    db.commit()
    return {"message": "Quiz submitted successfully", "score": score}
