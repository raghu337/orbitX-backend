from typing import Any, List

from fastapi import APIRouter, Depends

from app.core import deps
from app.db.session import get_db
from app.models.user import User as UserModel
from app.schemas.learning import UserProgressBase, UserProgressUpdate

router = APIRouter()

@router.get("/{user_id}", response_model=List[UserProgressBase])
def get_user_progress(
    user_id: int,
    db_conn: Any = Depends(get_db),
    current_user: UserModel = Depends(deps.get_current_user),
) -> Any:
    ref = db_conn.reference(f"user_progress/{user_id}")
    progress_data = ref.get() or {}

    progress = []
    for c_id, val in progress_data.items():
        cid = int(c_id) if c_id.isdigit() else c_id
        progress.append(UserProgressBase(
            course_id=cid,
            progress_percentage=val.get("progress_percentage", 0.0),
            score=val.get("score", 0)
        ))
    return progress

@router.post("/update")
def update_progress(
    *,
    db_conn: Any = Depends(get_db),
    progress_in: UserProgressUpdate,
    current_user: UserModel = Depends(deps.get_current_user),
) -> Any:
    ref = db_conn.reference(f"user_progress/{current_user.id}/{progress_in.course_id}")

    progress_data = {
        "user_id": current_user.id,
        "course_id": progress_in.course_id,
        "progress_percentage": progress_in.progress_percentage,
        "score": progress_in.score
    }
    ref.set(progress_data)

    return {"message": "Progress updated successfully"}
