from sqlalchemy import Column, Integer, String, Text, ForeignKey, JSON, Float
from sqlalchemy.orm import relationship
from app.db.session import Base

class Course(Base):
    __tablename__ = "courses"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(Text)
    difficulty_level = Column(String)

    quizzes = relationship("Quiz", back_populates="course")
    user_progress = relationship("UserProgress", back_populates="course")

class Quiz(Base):
    __tablename__ = "quizzes"

    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id"))
    question = Column(Text)
    options = Column(JSON) # ["A", "B", "C", "D"]
    correct_answer = Column(String)

    course = relationship("Course", back_populates="quizzes")

class UserProgress(Base):
    __tablename__ = "user_progress"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    course_id = Column(Integer, ForeignKey("courses.id"))
    progress_percentage = Column(Float, default=0.0)
    score = Column(Integer, default=0)

    course = relationship("Course", back_populates="user_progress")

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    satellite_id = Column(Integer, ForeignKey("satellites.id"))
    alert_type = Column(String) # "pass", "visibility", etc.
