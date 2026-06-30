import enum
from datetime import datetime

class UserRole(str, enum.Enum):
    USER = "user"
    ADMIN = "admin"

class User:
    def __init__(self, id=None, name=None, email=None, password_hash=None, role=UserRole.USER, created_at=None):
        self.id = id
        self.name = name
        self.email = email
        self.password_hash = password_hash
        self.role = role
        self.created_at = created_at or datetime.utcnow().isoformat()
