import json
import pytest
from unittest.mock import AsyncMock, patch


VALID_RESPONSE = json.dumps({
    "test_cases": [
        {"id": "tc1", "stdin": "4\n2 7 11 15\n9", "expected_stdout": "0 1", "is_hidden": False},
        {"id": "tc2", "stdin": "3\n3 2 4\n6", "expected_stdout": "1 2", "is_hidden": False},
        {"id": "tc3", "stdin": "2\n3 3\n6", "expected_stdout": "0 1", "is_hidden": False},
        {"id": "tc4", "stdin": "4\n1 2 3 4\n7", "expected_stdout": "2 3", "is_hidden": True},
        {"id": "tc5", "stdin": "2\n0 4\n4", "expected_stdout": "0 1", "is_hidden": True},
    ],
    "starter_code": {
        "python": "import sys\ndata = sys.stdin.read().split()\nprint('done')",
        "javascript": "const lines = require('fs').readFileSync('/dev/stdin','utf8').trim().split('\\n');\nconsole.log('done');"
    }
})

PROBLEM = {
    "title": "Two Sum",
    "description": "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
}


@pytest.mark.asyncio
async def test_generate_returns_test_cases():
    with patch("services.test_case_generator.chat_complete", new=AsyncMock(return_value=VALID_RESPONSE)):
        from services.test_case_generator import generate_test_cases
        result = await generate_test_cases(PROBLEM)
    assert len(result["test_cases"]) == 5
    assert result["test_cases"][0]["id"] == "tc1"
    assert "python" in result["starter_code"]
    assert "javascript" in result["starter_code"]


@pytest.mark.asyncio
async def test_generate_returns_empty_on_invalid_json():
    with patch("services.test_case_generator.chat_complete", new=AsyncMock(return_value="not json")):
        from services.test_case_generator import generate_test_cases
        result = await generate_test_cases(PROBLEM)
    assert result == {}


@pytest.mark.asyncio
async def test_generate_returns_empty_on_llm_error():
    with patch("services.test_case_generator.chat_complete", new=AsyncMock(side_effect=Exception("timeout"))):
        from services.test_case_generator import generate_test_cases
        result = await generate_test_cases(PROBLEM)
    assert result == {}


@pytest.mark.asyncio
async def test_generate_returns_empty_on_missing_keys():
    bad_response = json.dumps({"test_cases": []})  # missing "starter_code"
    with patch("services.test_case_generator.chat_complete", new=AsyncMock(return_value=bad_response)):
        from services.test_case_generator import generate_test_cases
        result = await generate_test_cases(PROBLEM)
    assert result == {}
