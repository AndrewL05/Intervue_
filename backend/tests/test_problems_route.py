import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from fastapi.testclient import TestClient
from main import app

FAKE_LC_LIST = [
    {"frontendQuestionId": "1", "title": "Two Sum", "titleSlug": "two-sum",
     "difficulty": "Easy", "isPaidOnly": False,
     "topicTags": [{"name": "Array", "slug": "array"}]},
    {"frontendQuestionId": "5", "title": "Longest Palindrome",
     "titleSlug": "longest-palindromic-substring",
     "difficulty": "Medium", "isPaidOnly": False,
     "topicTags": [{"name": "DP", "slug": "dynamic-programming"}]},
    {"frontendQuestionId": "10", "title": "Paid Problem", "titleSlug": "paid-problem",
     "difficulty": "Hard", "isPaidOnly": True, "topicTags": []},
]

LOCAL_PROBLEM = {
    "id": "two-sum", "title": "Two Sum", "difficulty": "easy",
    "description": "Find two indices.", "examples": [{"input": "nums=[2,7]", "output": "[0,1]"}],
    "constraints": ["2 ≤ n ≤ 10⁴"], "prompt": "...",
    "languages": ["python"], "starter_code": {"python": "def twoSum(): pass"},
    "test_cases": [{"id": "tc1", "stdin": "[2,7]\n9", "expected_stdout": "[0,1]", "is_hidden": False}],
}

FAKE_LC_DETAIL = {
    "title": "Longest Palindrome", "titleSlug": "longest-palindromic-substring",
    "difficulty": "Medium", "description": "Find the longest palindromic substring.",
    "topic_tags": ["DP"], "hints": [],
}


@pytest.fixture
def client():
    with TestClient(app) as c:
        yield c


def test_list_problems_excludes_paid_and_deduplicates(client):
    mock_db = MagicMock()
    mock_db.problems.find.return_value = [LOCAL_PROBLEM]

    with patch("routes.problems.db", mock_db), \
         patch("routes.problems.fetch_problem_list", new=AsyncMock(return_value=FAKE_LC_LIST)):
        resp = client.get("/api/problems?limit=50")

    assert resp.status_code == 200
    data = resp.json()
    slugs = [p["slug"] for p in data["problems"]]
    assert "paid-problem" not in slugs
    assert slugs.count("two-sum") == 1
    local_entry = next(p for p in data["problems"] if p["slug"] == "two-sum")
    assert local_entry["source"] == "local"
    assert local_entry["has_test_cases"] is True


def test_list_problems_filter_by_difficulty(client):
    mock_db = MagicMock()
    mock_db.problems.find.return_value = [LOCAL_PROBLEM]

    with patch("routes.problems.db", mock_db), \
         patch("routes.problems.fetch_problem_list", new=AsyncMock(return_value=FAKE_LC_LIST)):
        resp = client.get("/api/problems?difficulty=easy")

    assert resp.status_code == 200
    data = resp.json()
    for p in data["problems"]:
        assert p["difficulty"] == "easy"


def test_get_problem_returns_local_from_db(client):
    mock_db = MagicMock()
    mock_db.problems.find_one.return_value = LOCAL_PROBLEM

    with patch("routes.problems.db", mock_db):
        resp = client.get("/api/problems/two-sum")

    assert resp.status_code == 200
    data = resp.json()
    assert data["slug"] == "two-sum"
    assert data["source"] == "local"
    assert data["has_test_cases"] is True
    assert data["starter_code"] is not None


def test_get_problem_falls_back_to_leetcode(client):
    mock_db = MagicMock()
    mock_db.problems.find_one.return_value = None

    with patch("routes.problems.db", mock_db), \
         patch("routes.problems.fetch_problem_detail", new=AsyncMock(return_value=FAKE_LC_DETAIL)):
        resp = client.get("/api/problems/longest-palindromic-substring")

    assert resp.status_code == 200
    data = resp.json()
    assert data["source"] == "leetcode"
    assert data["has_test_cases"] is False


def test_get_problem_404_when_not_found(client):
    mock_db = MagicMock()
    mock_db.problems.find_one.return_value = None

    with patch("routes.problems.db", mock_db), \
         patch("routes.problems.fetch_problem_detail", new=AsyncMock(return_value=None)):
        resp = client.get("/api/problems/does-not-exist")

    assert resp.status_code == 404
