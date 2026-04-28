import json
import logging
from pathlib import Path
from models.code_submission import SubmissionStatus
from services.judge0 import submit_to_judge0
from db import db

logger = logging.getLogger(__name__)


def load_problem(problem_id: str) -> dict | None:
    return db.problems.find_one({"id": problem_id})


def load_all_problems() -> list[dict]:
    return list(db.problems.find({}))


def aggregate_status(statuses: list[SubmissionStatus]) -> SubmissionStatus:
    if not statuses:
        return SubmissionStatus.wrong_answer
    if SubmissionStatus.compile_error in statuses:
        return SubmissionStatus.compile_error
    if all(s == SubmissionStatus.accepted for s in statuses):
        return SubmissionStatus.accepted
    if SubmissionStatus.time_limit_exceeded in statuses:
        return SubmissionStatus.time_limit_exceeded
    if SubmissionStatus.runtime_error in statuses:
        return SubmissionStatus.runtime_error
    return SubmissionStatus.wrong_answer


async def run_test_cases(
    source_code: str,
    language: str,
    problem: dict,
    include_hidden: bool,
) -> list[dict]:
    """Run test cases against Judge0 and return per-case result dicts."""
    cases = problem["test_cases"]
    if not include_hidden:
        cases = [tc for tc in cases if not tc["is_hidden"]]

    results = []
    for tc in cases:
        result = await submit_to_judge0(
            source_code=source_code,
            language=language,
            stdin=tc["stdin"],
            expected_output=tc["expected_stdout"],
        )
        results.append({
            "test_case_id": tc["id"],
            "passed": result["passed"],
            "stdout": result["stdout"],
            "stderr": result["stderr"],
            "runtime_ms": result["runtime_ms"],
            "status": result["status"],
        })

        if result["status"] == SubmissionStatus.compile_error:
            break

    return results
