class Course:
    def __init__(self, id=None, title=None, description=None, difficulty_level=None):
        self.id = id
        self.title = title
        self.description = description
        self.difficulty_level = difficulty_level

class Quiz:
    def __init__(self, id=None, course_id=None, question=None, options=None, correct_answer=None):
        self.id = id
        self.course_id = course_id
        self.question = question
        self.options = options or []
        self.correct_answer = correct_answer

class UserProgress:
    def __init__(self, id=None, user_id=None, course_id=None, progress_percentage=0.0, score=0):
        self.id = id
        self.user_id = user_id
        self.course_id = course_id
        self.progress_percentage = progress_percentage
        self.score = score
