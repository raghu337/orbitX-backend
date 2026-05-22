from typing import Any, List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.schemas.learning import UserProgressBase, UserProgressUpdate
from app.models.learning import UserProgress as ProgressModel
from app.models.user import User as UserModel
from app.core import deps
from app.db.session import get_db

router = APIRouter()

@router.get("/{user_id}", response_model=List[UserProgressBase])
def get_user_progress(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(deps.get_current_user),
) -> Any:
    # Optional: Check if current_user matches user_id or is admin
    progress = db.query(ProgressModel).filter(ProgressModel.user_id == user_id).all()
    return progress

@router.post("/update")
def update_progress(
    *,
    db: Session = Depends(get_db),
    progress_in: UserProgressUpdate,
    current_user: UserModel = Depends(deps.get_current_user),
) -> Any:
    progress = db.query(ProgressModel).filter(
        ProgressModel.user_id == current_user.id,
        ProgressModel.course_id == progress_in.course_id
    ).first()
    
    if not progress:
        progress = ProgressModel(
            user_id=current_user.id,
            course_id=progress_in.course_id,
            progress_percentage=progress_in.progress_percentage,
            score=progress_in.score
        )
        db.add(progress)
    else:
        progress.progress_percentage = progress_in.progress_percentage
        progress.score = progress_in.score
    
    db.commit()
    return {"message": "Progress updated successfully"}
