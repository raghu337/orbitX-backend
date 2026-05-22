import sys
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.config import settings

# Build engine with full resilience settings:
# - pool_pre_ping: tests connection health before using it (prevents stale connections)
# - pool_timeout: max wait time to get a connection from pool (avoids infinite hang)
# - pool_recycle: recycle connections after 30 min (prevents dropped idle connections)
# - pool_size / max_overflow: controls concurrent connection limits
# - connect_args connect_timeout: max time to establish new TCP connection to postgres
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
    pool_timeout=10,
    pool_recycle=1800,
    pool_size=5,
    max_overflow=10,
    connect_args={
        "connect_timeout": 10,  # psycopg2: max seconds to establish connection
        "options": "-c statement_timeout=15000",  # postgres: max 15s per SQL statement
    }
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    """
    FastAPI dependency: yields a SQLAlchemy session and guarantees it is closed.
    
    IMPORTANT: This is a sync generator used with Depends(). It works correctly
    because FastAPI runs sync dependencies in a thread pool automatically.
    """
    print("[DB] Opening database session")
    db = SessionLocal()
    try:
        yield db
    except Exception as e:
        print(f"[DB] Session error, rolling back: {e}")
        db.rollback()
        raise
    finally:
        print("[DB] Closing database session")
        db.close()


def check_db_connection() -> bool:
    """
    Health-check: verifies the database is reachable.
    Returns True if OK, False if not.
    """
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        print("[DB] Health check: PostgreSQL connection OK")
        return True
    except Exception as e:
        print(f"[DB] Health check FAILED: {e}", file=sys.stderr)
        return False
