import sys
import os

sys.path.insert(0, os.path.abspath("backend"))

import main


def test_add_book_to_library():
    client = main.app.test_client()

    response = client.post(
        "/api/library",
        json={
            "title": "Testing Book 1000",
            "author": "Test Author",
            "cover_url": "",
            "status": "wishlist"
        }
    )

    assert response.status_code == 201

    data = response.get_json()

    assert data["message"] == "Book added successfully!"
    assert data["status"] == "wishlist"



def test_save_reading_progress():
    client = main.app.test_client()

    # First add a book to the library
    add_response = client.post(
        "/api/library",
        json={
            "title": "Progress Test Book",
            "author": "Test Author",
            "cover_url": "",
            "status": "current"
        }
    )

    assert add_response.status_code in [200, 201]

    # Save reading progress
    response = client.post(
        "/api/progress",
        json={
            "title": "Progress Test Book",
            "current_page": 5,
            "total_pages": 10
        }
    )

    assert response.status_code == 200

    data = response.get_json()

    assert data["current_page"] == 5
    assert data["total_pages"] == 10
    assert data["progress"] == 50

def test_save_progress_for_nonexistent_book():
    client = main.app.test_client()

    response = client.post(
        "/api/progress",
        json={
            "title": "Book That Does Not Exist",
            "current_page": 5,
            "total_pages": 10
        }
    )

    assert response.status_code == 404

    assert response.get_json()["message"] == "Book not found in library"