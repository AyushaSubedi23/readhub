import sys
import os

sys.path.insert(0, os.path.abspath("backend"))

import main


def test_register_valid_user():
    client = main.app.test_client()

    response = client.post(
        "/api/signup",
        json={
            "name": "Test User",
            "email": "testuser124@example.com",
            "password": "test123",
            "confirm_password": "test123"
        }
    )

    assert response.status_code == 200
    data = response.get_json()

    assert data["success"] is True
    assert "token" in data
    assert "user" in data

def test_login_valid_user():
    client = main.app.test_client()

    response = client.post(
        "/api/login",
        json={
            "email": "testuser124@example.com",
            "password": "test123"
        }
    )

    assert response.status_code == 200