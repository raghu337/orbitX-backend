from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException

from app.core import deps
from app.db.session import get_db
from app.models.user import User as UserModel
from app.schemas.learning import Course

router = APIRouter()

DEFAULT_COURSES = {
    "1": {
        "id": 1,
        "title": "Introduction to Orbital Mechanics",
        "description": "Learn the basics of Keplerian orbits, satellite altitude, and velocity calculations.",
        "difficulty_level": "Beginner"
    },
    "2": {
        "id": 2,
        "title": "Satellite Communication Systems",
        "description": "Understand frequency bands, signal propagation, and link budget calculations.",
        "difficulty_level": "Intermediate"
    },
    "3": {
        "id": 3,
        "title": "Deep Space Exploration",
        "description": "Explore trajectory planning, gravity assists, and interstellar probes.",
        "difficulty_level": "Advanced"
    }
}

@router.get("/courses", response_model=List[Course])
def read_courses(
    db_conn: Any = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    ref = db_conn.reference("courses")
    courses_data = ref.get()

    # Auto-seed if database node is empty
    if not courses_data:
        ref.set(DEFAULT_COURSES)
        courses_data = DEFAULT_COURSES

    courses = []
    for c_id, val in courses_data.items():
        cid = int(c_id) if c_id.isdigit() else c_id
        courses.append(Course(
            id=cid,
            title=val.get("title"),
            description=val.get("description"),
            difficulty_level=val.get("difficulty_level")
        ))
    courses.sort(key=lambda x: x.id)
    return courses[skip:skip+limit]

@router.get("/courses/{id}", response_model=Course)
def read_course_by_id(
    id: int,
    db_conn: Any = Depends(get_db),
) -> Any:
    ref = db_conn.reference(f"courses/{id}")
    course_data = ref.get()
    if not course_data:
        raise HTTPException(status_code=404, detail="Course not found")

    return Course(
        id=id,
        title=course_data.get("title"),
        description=course_data.get("description"),
        difficulty_level=course_data.get("difficulty_level")
    )

@router.post("/quiz/submit")
def submit_quiz(
    *,
    db_conn: Any = Depends(get_db),
    course_id: int,
    score: int,
    current_user: UserModel = Depends(deps.get_current_user),
) -> Any:
    ref = db_conn.reference(f"user_progress/{current_user.id}/{course_id}")
    progress_data = ref.get()

    if not progress_data:
        progress_data = {
            "user_id": current_user.id,
            "course_id": course_id,
            "progress_percentage": 100.0,
            "score": score
        }
    else:
        progress_data["score"] = max(progress_data.get("score", 0), score)
        progress_data["progress_percentage"] = 100.0

    ref.set(progress_data)
    return {"message": "Quiz submitted successfully", "score": score}
