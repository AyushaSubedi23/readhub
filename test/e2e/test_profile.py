import sys
import os

sys.path.insert(0, os.path.abspath("backend"))

import main


def test_profile_page_available():
    client = main.app.test_client()

    response = client.get("/profile")

    assert response.status_code == 200