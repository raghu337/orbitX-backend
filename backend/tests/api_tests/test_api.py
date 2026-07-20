import pytest
from unittest.mock import patch, MagicMock
from app.core.deps import get_current_user
from app.models.user import User
from app.main import app

# Fixture to override current user authentication
@pytest.fixture(autouse=True)
def override_auth():
    mock_user = User(
        id="mock_user_id",
        name="Reddy RaghuVardhan",
        email="astronaut@orbitx.com",
        password_hash="mock_hash",
        role="astronaut",
        created_at="2026-07-20T12:00:00"
    )
    app.dependency_overrides[get_current_user] = lambda: mock_user
    yield
    app.dependency_overrides.pop(get_current_user, None)

@patch("app.db.session.get_db")
def test_read_courses(mock_get_db, client):
    """Test retrieving course catalog with database mock."""
    mock_ref = MagicMock()
    mock_ref.get.return_value = {
        "1": {
            "title": "Orbital Testing Course",
            "description": "Learn to test orbital paths",
            "difficulty_level": "Beginner"
        }
    }
    mock_get_db.return_value.reference.return_value = mock_ref

    response = client.get("/api/v1/learning/courses")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["title"] == "Orbital Testing Course"

@patch("app.db.session.get_db")
def test_read_course_by_id_success(mock_get_db, client):
    """Test retrieving single course by ID."""
    mock_ref = MagicMock()
    mock_ref.get.return_value = {
        "title": "Orbital Testing Course",
        "description": "Learn to test orbital paths",
        "difficulty_level": "Beginner"
    }
    mock_get_db.return_value.reference.return_value = mock_ref

    response = client.get("/api/v1/learning/courses/1")
    assert response.status_code == 200
    assert response.json()["title"] == "Orbital Testing Course"

@patch("app.db.session.get_db")
def test_submit_quiz(mock_get_db, client):
    """Test quiz submission endpoint."""
    mock_ref = MagicMock()
    mock_ref.get.return_value = None
    mock_get_db.return_value.reference.return_value = mock_ref

    response = client.post("/api/v1/learning/quiz/submit?course_id=1&score=95")
    assert response.status_code == 200
    assert response.json() == {"message": "Quiz submitted successfully", "score": 95}

@patch("app.db.session.get_db")
def test_read_satellites(mock_get_db, client):
    """Test retrieving satellite list."""
    mock_ref = MagicMock()
    mock_ref.get.return_value = {
        "25544": {
            "name": "ISS (ZARYA)",
            "norad_id": 25544,
            "country": "US/RUSSIA",
            "launch_date": "1998-11-20T00:00:00",
            "orbit_type": "LEO"
        }
    }
    mock_get_db.return_value.reference.return_value = mock_ref

    response = client.get("/api/v1/satellites/")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["name"] == "ISS (ZARYA)"

@patch("app.db.session.get_db")
def test_favorite_satellite(mock_get_db, client):
    """Test adding satellite to user favorites."""
    mock_ref = MagicMock()
    mock_ref.get.return_value = {
        "name": "ISS (ZARYA)",
        "norad_id": 25544,
        "country": "US/RUSSIA",
        "launch_date": "1998-11-20T00:00:00",
        "orbit_type": "LEO"
    }
    mock_get_db.return_value.reference.return_value = mock_ref

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
