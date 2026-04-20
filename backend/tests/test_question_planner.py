import json
import pytest
from unittest.mock import AsyncMock, patch

from services.question_planner import (
    _question_count,
    _parse_questions_json,
    plan_behavioral_questions,
)


def test_question_count():
    assert _question_count(15) == 2
    assert _question_count(20) == 2
    assert _question_count(30) == 3
    assert _question_count(45) == 5
    assert _question_count(60) == 6
    assert _question_count(90) == 6


def test_parse_questions_json_valid():
    raw = json.dumps({"questions": ["Q1", "Q2", "Q3"]})
    result = _parse_questions_json(raw, 3)
    assert result == ["Q1", "Q2", "Q3"]


def test_parse_questions_json_strips_markdown():
    raw = "```json\n" + json.dumps({"questions": ["Q1", "Q2"]}) + "\n```"
    result = _parse_questions_json(raw, 2)
    assert result == ["Q1", "Q2"]


def test_parse_questions_json_caps_at_expected():
    raw = json.dumps({"questions": ["Q1", "Q2", "Q3", "Q4"]})
    result = _parse_questions_json(raw, 2)
    assert result == ["Q1", "Q2"]


def test_parse_questions_json_invalid_raises():
    with pytest.raises(ValueError):
        _parse_questions_json("not json", 3)


@pytest.mark.asyncio
async def test_plan_behavioral_questions_calls_llm():
    fake_response = json.dumps({
        "questions": [
            "Tell me about a time you led a project under a tight deadline.",
            "Describe a conflict with a teammate and how you resolved it.",
            "Give an example of a decision you made with incomplete information.",
        ]
    })
    with patch("services.question_planner.chat_complete", new=AsyncMock(return_value=fake_response)):
        questions = await plan_behavioral_questions("session_abc", 30)

    assert len(questions) == 3
    assert all(q.type.value == "behavioral" for q in questions)
    assert questions[0].session_id == "session_abc"
    assert questions[0].order == 0
    assert questions[1].order == 1
