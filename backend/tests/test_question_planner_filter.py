from unittest.mock import patch
from services.question_planner import plan_questions
from models.interview_session import Difficulty, InterviewMode

PROBLEMS = [
    {"id": "runnable-easy", "difficulty": "easy", "prompt": "Easy runnable.", "test_cases": [{"id": "t1"}]},
    {"id": "no-tests-easy", "difficulty": "easy", "prompt": "Easy no tests."},
    {"id": "runnable-medium", "difficulty": "medium", "prompt": "Medium runnable.", "test_cases": [{"id": "t2"}]},
    {"id": "no-tests-medium", "difficulty": "medium", "prompt": "Medium no tests."},
]


def test_plan_questions_only_picks_runnable_problems():
    with patch("services.question_planner.load_all_problems", return_value=PROBLEMS):
        questions = plan_questions("sess1", InterviewMode.technical, Difficulty.easy, 30)
    assert all(q.coding_problem_id == "runnable-easy" for q in questions)


def test_plan_questions_falls_back_to_any_runnable_when_diff_has_none():
    problems = [
        {"id": "no-tests-hard", "difficulty": "hard", "prompt": "Hard no tests."},
        {"id": "runnable-easy", "difficulty": "easy", "prompt": "Easy runnable.", "test_cases": [{"id": "t1"}]},
    ]
    with patch("services.question_planner.load_all_problems", return_value=problems):
        questions = plan_questions("sess2", InterviewMode.technical, Difficulty.hard, 30)
    assert all(q.coding_problem_id == "runnable-easy" for q in questions)


def test_plan_questions_returns_empty_for_behavioral_mode():
    with patch("services.question_planner.load_all_problems", return_value=PROBLEMS):
        questions = plan_questions("sess3", InterviewMode.behavioral, Difficulty.easy, 30)
    assert questions == []
