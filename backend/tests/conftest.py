import os
import sys
from unittest.mock import MagicMock

# Set mock env variables before importing anything from the app
os.environ["SECRET_KEY"] = "9s8dfyhsudifh98shf98hsd9fhsdhf9shdf9shdf9shdf9shdf9shdf"
os.environ["FIREBASE_CREDENTIALS_PATH"] = "mock-credentials.json"
os.environ["FIREBASE_DATABASE_URL"] = "https://mock-database.firebaseio.com"
os.environ["N2YO_API_KEY"] = "mock_key"
os.environ["GROQ_API_KEY"] = "mock_groq"

# Mock firebase_admin and database calls globally for testing
sys.modules['firebase_admin'] = MagicMock()
sys.modules['firebase_admin.credentials'] = MagicMock()
sys.modules['firebase_admin.db'] = MagicMock()

import pytest  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402


@pytest.fixture(scope="session")
def client():
    # Lazy import of app after mocks are in place
    # Mock check_db_connection to return True
    from app.db import session
    from app.main import app
    session.check_db_connection = MagicMock(return_value=True)

    # Mock db references
    mock_db = MagicMock()
    session.db = mock_db

    with TestClient(app) as test_client:
        yield test_client
