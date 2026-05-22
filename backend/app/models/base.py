# Import all models here so that Base.metadata has them
from app.db.session import Base
from app.models.user import User
from app.models.satellite import Satellite, SatelliteTracking, Favorite
from app.models.learning import Course, Quiz, UserProgress, Alert
