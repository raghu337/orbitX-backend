import sys
import firebase_admin
from firebase_admin import credentials, db
from app.core.config import settings

# Initialize Firebase Admin SDK
try:
    if not firebase_admin._apps:
        cred = credentials.Certificate(settings.FIREBASE_CREDENTIALS_PATH)
        firebase_admin.initialize_app(cred, {
            'databaseURL': settings.FIREBASE_DATABASE_URL
        })
    print("[Firebase] Initialization OK")
except Exception as e:
    print(f"[Firebase] WARNING: Initialization failed. Ensure {settings.FIREBASE_CREDENTIALS_PATH} is present: {e}", file=sys.stderr)

def get_db():
    """
    FastAPI dependency: yields the Firebase database handle.
    """
    return db

def check_db_connection() -> bool:
    """
    Health-check: verifies Firebase reachability.
    """
    try:
        db.reference(".info/connected").get()
        return True
    except Exception as e:
        print(f"[Firebase] Health check failed: {e}", file=sys.stderr)
        return False
