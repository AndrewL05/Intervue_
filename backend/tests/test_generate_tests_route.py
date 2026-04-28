import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from fastapi.testclient import TestClient
from main import app
from auth.clerk import require_auth


@pytest.fixture
def client():
    app.dependency_overrides[require_auth] = lambda: "test_user_id"
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


FAKE_DETAIL = {
    "title": "Regular Expression Matching",
    "titleSlug": "regular-expression-matching",
    "difficulty": "Hard",
    "description": "Implement regex matching.",
    "topic_tags": ["String", "DP"],
    "hints": [],
    "example_testcases": "",
    "question_html": """
<p>Implement regex.</p>
<p><strong class="example">Example 1:</strong></p>
<pre>
<strong>Input:</strong> s = &quot;aa&quot;, p = &quot;a&quot;
<strong>Output:</strong> false
</pre>
<p><strong>Constraints:</strong></p>
<ul><li><code>1 &lt;= s.length &lt;= 20</code></li></ul>
""",
}

FAKE_GENERATED = {
    "test_cases": [
        {"id": "tc1", "stdin": "aa\na", "expected_stdout": "false", "is_hidden": False},
        {"id": "tc2", "stdin": "aa\na*", "expected_stdout": "true", "is_hidden": False},
        {"id": "tc3", "stdin": "ab\n.*", "expected_stdout": "true", "is_hidden": False},
        {"id": "tc4", "stdin": "\na*", "expected_stdout": "true", "is_hidden": True},
        {"id": "tc5", "stdin": "aab\nc*a*b", "expected_stdout": "true", "is_hidden": True},
    ],
    "starter_code": {
        "python": "import sys\nlines = sys.stdin.read().split('\\n')\n# TODO",
        "javascript": "// TODO",
        "java": "// TODO",
        "cpp": "// TODO",
        "go": "// TODO",
    },
    "examples": [{"input": 's = "aa", p = "a"', "output": "false", "explanation": None}],
    "constraints": ["1 <= s.length <= 20"],
}

FAKE_PROBLEM_IN_DB = {
    "id": "regular-expression-matching",
    "title": "Regular Expression Matching",
    "difficulty": "hard",
    "description": "Implement regex matching.",
    "examples": FAKE_GENERATED["examples"],
    "constraints": FAKE_GENERATED["constraints"],
    "topic_tags": ["String", "DP"],
    "test_cases": FAKE_GENERATED["test_cases"],
    "starter_code": FAKE_GENERATED["starter_code"],
}


def test_generate_tests_new_problem(client):
    mock_db = MagicMock()
    mock_db.problems.find_one.side_effect = [None, FAKE_PROBLEM_IN_DB]

    with patch("routes.problems.db", mock_db), \
         patch("routes.problems.fetch_problem_detail", new=AsyncMock(return_value=FAKE_DETAIL)), \
         patch("routes.problems.generate_full_problem", new=AsyncMock(return_value=FAKE_GENERATED)):
        resp = client.post("/api/problems/regular-expression-matching/generate-tests")

    assert resp.status_code == 200
    data = resp.json()
    assert data["slug"] == "regular-expression-matching"
    assert data["has_test_cases"] is True
    assert data["starter_code"] is not None
    assert len(data["examples"]) == 1
    assert data["constraints"] == ["1 <= s.length <= 20"]


def test_generate_tests_returns_existing_if_already_has_test_cases(client):
    mock_db = MagicMock()
    mock_db.problems.find_one.return_value = FAKE_PROBLEM_IN_DB

    with patch("routes.problems.db", mock_db):
        resp = client.post("/api/problems/regular-expression-matching/generate-tests")

    assert resp.status_code == 200
    data = resp.json()
    assert data["has_test_cases"] is True


def test_generate_tests_404_when_not_in_lc_api(client):
    mock_db = MagicMock()
    mock_db.problems.find_one.return_value = None

    with patch("routes.problems.db", mock_db), \
         patch("routes.problems.fetch_problem_detail", new=AsyncMock(return_value=None)):
        resp = client.post("/api/problems/does-not-exist/generate-tests")

    assert resp.status_code == 404


def test_generate_tests_502_when_llm_fails(client):
    mock_db = MagicMock()
    mock_db.problems.find_one.return_value = None

    with patch("routes.problems.db", mock_db), \
         patch("routes.problems.fetch_problem_detail", new=AsyncMock(return_value=FAKE_DETAIL)), \
         patch("routes.problems.generate_full_problem", new=AsyncMock(return_value={})):
        resp = client.post("/api/problems/regular-expression-matching/generate-tests")

    assert resp.status_code == 502
