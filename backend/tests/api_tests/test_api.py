from unittest.mock import MagicMock, patch
import pytest
from app.core.deps import get_current_user
from app.db.session import get_db
from app.main import app
from app.models.user import User

# Fixture to override current user authentication and database dependency
@pytest.fixture(autouse=True)
def override_deps():
    mock_user = User(
        id="mock_user_id",
        name="Reddy RaghuVardhan",
        email="astronaut@orbitx.com",
        password_hash="mock_hash",
        role="astronaut",
        created_at="2026-07-20T12:00:00"
    )
    
    mock_db = MagicMock()
    
    def mock_ref_factory(path):
        m = MagicMock()
        if path in ("courses", "learning/courses"):
            m.get.return_value = {
                "1": {
                    "id": 1,
                    "title": "Orbital Testing Course",
                    "description": "Learn to test orbital paths",
                    "difficulty_level": "Beginner"
                }
            }
        elif path.startswith("courses/") or path.startswith("learning/courses/"):
            m.get.return_value = {
                "id": 1,
                "title": "Orbital Testing Course",
                "description": "Learn to test orbital paths",
                "difficulty_level": "Beginner"
            }
        elif path in ("satellites", "satellites/"):
            m.get.return_value = {
                "25544": {
                    "id": 25544,
                    "name": "ISS (ZARYA)",
                    "norad_id": 25544,
                    "country": "US/RUSSIA",
                    "launch_date": "1998-11-20T00:00:00",
                    "orbit_type": "LEO"
                }
            }
        elif path.startswith("satellites/"):
            m.get.return_value = {
                "id": 25544,
                "name": "ISS (ZARYA)",
                "norad_id": 25544,
                "country": "US/RUSSIA",
                "launch_date": "1998-11-20T00:00:00",
                "orbit_type": "LEO"
            }
        else:
            m.get.return_value = None
        return m

    mock_db.reference.side_effect = mock_ref_factory

    app.dependency_overrides[get_current_user] = lambda: mock_user
    app.dependency_overrides[get_db] = lambda: mock_db
    yield mock_db
    app.dependency_overrides.pop(get_current_user, None)
    app.dependency_overrides.pop(get_db, None)

def test_read_courses(client):
    """Test retrieving course catalog with database mock."""
    response = client.get("/api/v1/learning/courses")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["title"] == "Orbital Testing Course"

def test_read_course_by_id_success(client):
    """Test retrieving single course by ID."""
    response = client.get("/api/v1/learning/courses/1")
    assert response.status_code == 200
    assert response.json()["title"] == "Orbital Testing Course"

def test_submit_quiz(client):
    """Test quiz submission endpoint."""
    response = client.post("/api/v1/learning/quiz/submit?course_id=1&score=95")
    assert response.status_code == 200
    assert response.json() == {"message": "Quiz submitted successfully", "score": 95}

def test_read_satellites(client):
    """Test retrieving satellite list."""
    response = client.get("/api/v1/satellites/")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["name"] == "ISS (ZARYA)"

def test_favorite_satellite(client):
    """Test adding satellite to user favorites."""
    response = client.post("/api/v1/satellites/favorite?satellite_id=25544")
    assert response.status_code == 200
    assert response.json()["name"] == "ISS (ZARYA)"

@patch("httpx.AsyncClient.get")
def test_get_tle_for_satellite(mock_get, client):
    """Test TLE element retrieval with Celestrack HTTP mock."""
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.text = "ISS (ZARYA)\n1 25544U 98067A   23270.52358826  .00016717  00000-0  30129-3 0  9997\n2 25544  51.6428 261.2341 0005678  87.2345 272.9876 15.49876543412344"
    mock_get.return_value = mock_response

    response = client.get("/api/v1/satellites/25544/tle")
    assert response.status_code == 200
    data = response.json()
    assert "tle1" in data
    assert "tle2" in data
    assert data["tle1"].startswith("1 25544U")
