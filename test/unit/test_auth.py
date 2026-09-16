import sys
import os
import time
sys.path.insert(0, os.path.abspath("backend"))

import main


def test_register_valid_user():
    client = main.app.test_client()

    response = client.post(
        "/api/signup",
        json={
            "name": "Test User",
            "email": f"validuser{time.time()}@example.com",
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
            "email": "validuser2026@example.com",
            "password": "test123"
        }
    )



    assert response.status_code == 200
def test_login_with_incorrect_password():
    client = main.app.test_client()

    response = client.post(
        "/api/login",
        json={
           "email": "validuser2026@example.com",
            "password": "wrongpassword"
        }
    )

    assert response.status_code == 401

def test_register_with_short_password():
    client = main.app.test_client()

    response = client.post(
        "/api/signup",
        json={
            "name": "Short Password User",
            "email": "shortpassword2026@example.com",
            "password": "123",
            "confirm_password": "123"
        }
    )

    assert response.status_code == 400