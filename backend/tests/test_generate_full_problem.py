import pytest
from unittest.mock import AsyncMock, patch
from services.test_case_generator import generate_full_problem


MOCK_LLM_RESPONSE = '''
{
  "test_cases": [
    {"id": "tc1", "stdin": "aa\\na", "expected_stdout": "false", "is_hidden": false},
    {"id": "tc2", "stdin": "aa\\na*", "expected_stdout": "true", "is_hidden": false},
    {"id": "tc3", "stdin": "ab\\n.*", "expected_stdout": "true", "is_hidden": false},
    {"id": "tc4", "stdin": "\\na*", "expected_stdout": "true", "is_hidden": true},
    {"id": "tc5", "stdin": "mississippi\\nmis*is*p*.", "expected_stdout": "false", "is_hidden": true}
  ],
  "solution": {
    "python": "import sys\\nlines = sys.stdin.read().strip().split('\\\\n')\\nprint('false')"
  },
  "starter_code": {
    "python": "import sys\\nlines = sys.stdin.read().strip().split('\\\\n')\\ns = lines[0]\\np = lines[1]\\n# TODO",
    "javascript": "const lines = require('fs').readFileSync('/dev/stdin','utf8').trim().split('\\\\n');\\n// TODO",
    "java": "import java.util.*;\\nimport java.io.*;\\npublic class Main { public static void main(String[] args) {} }",
    "cpp": "#include<bits/stdc++.h>\\nusing namespace std;\\nint main(){}",
    "go": "package main\\nimport \\"fmt\\"\\nfunc main(){}"
  }
}
'''

MOCK_INVALID_JSON = "```json\nNot valid JSON at all\n```"

PROBLEM = {
    "title": "Regular Expression Matching",
    "description": "Implement regex matching with '.' and '*'.",
    "examples": [
        {"input": 's = "aa", p = "a"', "output": "false", "explanation": None},
        {"input": 's = "aa", p = "a*"', "output": "true", "explanation": None},
    ],
    "constraints": ["1 <= s.length <= 20", "s contains only lowercase letters"],
}


@pytest.mark.asyncio
async def test_returns_five_test_cases():
    with patch("services.test_case_generator.chat_complete", new=AsyncMock(return_value=MOCK_LLM_RESPONSE)):
        result = await generate_full_problem(PROBLEM)
    assert len(result["test_cases"]) == 5


@pytest.mark.asyncio
async def test_first_three_visible_last_two_hidden():
    with patch("services.test_case_generator.chat_complete", new=AsyncMock(return_value=MOCK_LLM_RESPONSE)):
        result = await generate_full_problem(PROBLEM)
    visible = [tc for tc in result["test_cases"] if not tc["is_hidden"]]
    hidden = [tc for tc in result["test_cases"] if tc["is_hidden"]]
    assert len(visible) == 3
    assert len(hidden) == 2


@pytest.mark.asyncio
async def test_starter_code_has_all_five_languages():
    with patch("services.test_case_generator.chat_complete", new=AsyncMock(return_value=MOCK_LLM_RESPONSE)):
        result = await generate_full_problem(PROBLEM)
    sc = result["starter_code"]
    for lang in ("python", "javascript", "java", "cpp", "go"):
        assert lang in sc, f"Missing starter_code for {lang}"
        assert isinstance(sc[lang], str) and len(sc[lang]) > 0


@pytest.mark.asyncio
async def test_examples_and_constraints_passed_through():
    with patch("services.test_case_generator.chat_complete", new=AsyncMock(return_value=MOCK_LLM_RESPONSE)):
        result = await generate_full_problem(PROBLEM)
    assert result["examples"] == PROBLEM["examples"]
    assert result["constraints"] == PROBLEM["constraints"]


@pytest.mark.asyncio
async def test_returns_empty_dict_on_invalid_json():
    with patch("services.test_case_generator.chat_complete", new=AsyncMock(return_value=MOCK_INVALID_JSON)):
        result = await generate_full_problem(PROBLEM)
    assert result == {}


@pytest.mark.asyncio
async def test_strips_markdown_fences():
    fenced = f"```json\n{MOCK_LLM_RESPONSE.strip()}\n```"
    with patch("services.test_case_generator.chat_complete", new=AsyncMock(return_value=fenced)):
        result = await generate_full_problem(PROBLEM)
    assert len(result["test_cases"]) == 5


@pytest.mark.asyncio
async def test_retries_on_first_failure():
    bad = "not json"
    good = MOCK_LLM_RESPONSE
    with patch("services.test_case_generator.chat_complete", new=AsyncMock(side_effect=[bad, good])):
        result = await generate_full_problem(PROBLEM)
    assert len(result["test_cases"]) == 5
