from unittest.mock import MagicMock, patch


def test_root_endpoint(client):
    """Test the root endpoint returns expected structure."""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "message" in data
    assert data["message"] == "OrbitX Backend Running"
    assert "timestamp" in data

def test_health_endpoint(client):
    """Test the health check endpoint returns status ok."""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"

@patch("app.services.groq_service.get_chat_response")
def test_search_space_endpoint(mock_get_chat, client):
    """Test the search endpoint routes queries to Groq service."""
    mock_get_chat.return_value = "Mocked space reply from Groq"

    payload = {"query": "Tell me about Mars", "history": []}
    response = client.post("/api/search", json=payload)

    assert response.status_code == 200
    data = response.json()
    assert "response" in data
    assert "results" in data
    assert data["response"] == "Mocked space reply from Groq"
    assert data["results"][0]["title"] == "Space Assistant Answer"

@patch("app.db.session.get_db")
def test_forgot_password_root_success(mock_get_db, client):
    """Testforgot password root endpoint handles valid registered email."""
    # Set up mock database reference
    mock_ref = MagicMock()
    mock_ref.order_by_child.return_value.equal_to.return_value.get.return_value = {
        "user_id_1": {"email": "test@example.com", "name": "Test User"}
    }
    mock_get_db.return_value.reference.return_value = mock_ref

    payload = {"email": "test@example.com"}
    response = client.post("/api/auth/forgot-password", json=payload)

    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "password reset notification has been sent" in data["message"]

@patch("app.db.session.get_db")
def test_forgot_password_root_not_found(mock_get_db, client):
    """Test forgot password root endpoint returns 404 for unregistered email."""
    mock_ref = MagicMock()
    mock_ref.order_by_child.return_value.equal_to.return_value.get.return_value = None
    mock_get_db.return_value.reference.return_value = mock_ref

    payload = {"email": "unregistered@example.com"}
    response = client.post("/api/auth/forgot-password", json=payload)

    assert response.status_code == 404
    assert "No account registered" in response.json()["detail"]
