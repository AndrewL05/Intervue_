import pytest
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient

with patch("auth.clerk._upsert_user"), \
     patch("auth.clerk._jwks_client") as mock_jwks, \
     patch("services.problems_seed.seed_problems"):
    from main import app

client = TestClient(app)

AUTH = {"Authorization": "Bearer test-token"}
USER_ID = "user_test123"


def _fake_verify(token):
    return {"sub": USER_ID}


def test_get_solved_empty():
    mock_db = MagicMock()
    mock_db.solved_problems.find.return_value = []
    with patch("auth.clerk.verify_token", side_effect=_fake_verify), \
         patch("auth.clerk._upsert_user"), \
         patch("routes.problems.db", mock_db):
        resp = client.get("/api/problems/solved", headers=AUTH)
    assert resp.status_code == 200
    assert resp.json() == {"solved_slugs": []}


def test_mark_solved():
    mock_db = MagicMock()
    mock_db.solved_problems.update_one.return_value = MagicMock(matched_count=0)
    with patch("auth.clerk.verify_token", side_effect=_fake_verify), \
         patch("auth.clerk._upsert_user"), \
         patch("routes.problems.db", mock_db):
        resp = client.post("/api/problems/two-sum/solve", headers=AUTH)
    assert resp.status_code == 200
    assert resp.json()["slug"] == "two-sum"


def test_get_solved_with_items():
    mock_db = MagicMock()
    mock_db.solved_problems.find.return_value = [
        {"problem_slug": "two-sum"},
        {"problem_slug": "reverse-string"},
    ]
    with patch("auth.clerk.verify_token", side_effect=_fake_verify), \
         patch("auth.clerk._upsert_user"), \
         patch("routes.problems.db", mock_db):
        resp = client.get("/api/problems/solved", headers=AUTH)
    assert resp.status_code == 200
    assert set(resp.json()["solved_slugs"]) == {"two-sum", "reverse-string"}
