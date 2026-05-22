from typing import Optional, List
from pydantic import BaseModel

class CourseBase(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    difficulty_level: Optional[str] = None

class Course(CourseBase):
    id: int

    class Config:
        from_attributes = True

class QuizBase(BaseModel):
    course_id: int
    question: str
    options: List[str]
    correct_answer: str

class Quiz(QuizBase):
    id: int

    class Config:
        from_attributes = True

class UserProgressBase(BaseModel):
    course_id: int
    progress_percentage: float
    score: int

class UserProgressUpdate(BaseModel):
    course_id: int
    progress_percentage: float
    score: int
