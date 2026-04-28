from unittest.mock import MagicMock, patch, mock_open
import importlib
import json
import services.problems_seed as _ps_mod

SAMPLE_PROBLEMS = [
    {
        "id": "two-sum",
        "title": "Two Sum",
        "difficulty": "easy",
        "description": "Find two indices.",
        "examples": [{"input": "nums=[2,7]", "output": "[0,1]"}],
        "constraints": ["2 ≤ n ≤ 10⁴"],
        "prompt": "Find indices of two numbers that sum to target.",
        "languages": ["python"],
        "starter_code": {"python": "def twoSum(): pass"},
        "test_cases": [{"id": "tc1", "stdin": "[2,7]\n9", "expected_stdout": "[0,1]", "is_hidden": False}],
    },
    {
        "id": "valid-parentheses",
        "title": "Valid Parentheses",
        "difficulty": "easy",
        "description": "Check brackets.",
        "examples": [],
        "constraints": [],
        "prompt": "Determine if brackets are valid.",
        "languages": ["python"],
        "starter_code": {"python": "def isValid(): pass"},
        "test_cases": [],
    },
]


def test_seed_inserts_when_collection_empty():
    mock_db = MagicMock()
    mock_db.problems.count_documents.return_value = 0

    importlib.reload(_ps_mod)
    with patch("services.problems_seed.db", mock_db), \
         patch("builtins.open", mock_open(read_data=json.dumps(SAMPLE_PROBLEMS))):
        _ps_mod.seed_problems()

    mock_db.problems.insert_many.assert_called_once()
    inserted = mock_db.problems.insert_many.call_args[0][0]
    assert len(inserted) == 2
    assert inserted[0]["id"] == "two-sum"


def test_seed_skips_when_collection_has_documents():
    mock_db = MagicMock()
    mock_db.problems.count_documents.return_value = 5

    importlib.reload(_ps_mod)
    with patch("services.problems_seed.db", mock_db), \
         patch("builtins.open", mock_open(read_data=json.dumps(SAMPLE_PROBLEMS))):
        _ps_mod.seed_problems()

    mock_db.problems.insert_many.assert_not_called()


def test_seed_documents_include_required_fields():
    mock_db = MagicMock()
    mock_db.problems.count_documents.return_value = 0

    importlib.reload(_ps_mod)
    with patch("services.problems_seed.db", mock_db), \
         patch("builtins.open", mock_open(read_data=json.dumps(SAMPLE_PROBLEMS))):
        _ps_mod.seed_problems()

    inserted = mock_db.problems.insert_many.call_args[0][0]
    doc = inserted[0]
    for field in ("id", "title", "difficulty", "description", "starter_code", "test_cases"):
        assert field in doc, f"Missing field: {field}"


def test_load_problem_queries_db():
    mock_db = MagicMock()
    mock_db.problems.find_one.return_value = SAMPLE_PROBLEMS[0]

    with patch("services.code_runner.db", mock_db):
        from services import code_runner
        result = code_runner.load_problem("two-sum")

    mock_db.problems.find_one.assert_called_once_with({"id": "two-sum"})
    assert result["id"] == "two-sum"


def test_load_all_problems_queries_db():
    mock_db = MagicMock()
    mock_db.problems.find.return_value = SAMPLE_PROBLEMS

    with patch("services.code_runner.db", mock_db):
        from services import code_runner
        results = code_runner.load_all_problems()

    mock_db.problems.find.assert_called_once_with({})
    assert len(results) == 2
