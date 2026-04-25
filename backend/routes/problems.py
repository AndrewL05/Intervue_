import logging

from fastapi import APIRouter, HTTPException, Query

from db import db
from schemas.problems import ProblemDetail, ProblemExample, ProblemListItem, ProblemListResponse
from services.leetcode_client import fetch_problem_detail, fetch_problem_list

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/problems", tags=["problems"])


def _normalize_difficulty(raw: str) -> str:
    return raw.lower()


def _local_to_list_item(p: dict) -> ProblemListItem:
    return ProblemListItem(
        slug=p["id"],
        title=p["title"],
        difficulty=_normalize_difficulty(p["difficulty"]),
        source="local",
        has_test_cases=bool(p.get("test_cases")),
        topic_tags=p.get("topic_tags", []),
    )


def _lc_to_list_item(p: dict) -> ProblemListItem:
    return ProblemListItem(
        slug=p["titleSlug"],
        title=p["title"],
        difficulty=_normalize_difficulty(p["difficulty"]),
        source="leetcode",
        has_test_cases=False,
        topic_tags=[t["name"] for t in p.get("topicTags", [])],
    )


def _local_to_detail(p: dict) -> ProblemDetail:
    examples = [
        ProblemExample(
            input=ex.get("input", ""),
            output=ex.get("output", ""),
            explanation=ex.get("explanation"),
        )
        for ex in p.get("examples", [])
    ]
    return ProblemDetail(
        slug=p["id"],
        title=p["title"],
        difficulty=_normalize_difficulty(p["difficulty"]),
        source="local",
        has_test_cases=bool(p.get("test_cases")),
        description=p.get("description", ""),
        examples=examples,
        constraints=p.get("constraints", []),
        topic_tags=p.get("topic_tags", []),
        starter_code=p.get("starter_code"),
        hints=[],
    )


def _lc_to_detail(d: dict) -> ProblemDetail:
    return ProblemDetail(
        slug=d["titleSlug"],
        title=d["title"],
        difficulty=_normalize_difficulty(d["difficulty"]),
        source="leetcode",
        has_test_cases=False,
        description=d.get("description", ""),
        examples=[],
        constraints=[],
        topic_tags=d.get("topic_tags", []),
        starter_code=None,
        hints=d.get("hints", []),
    )


@router.get("", response_model=ProblemListResponse)
async def list_problems(
    limit: int = Query(50, ge=1, le=200),
    skip: int = Query(0, ge=0),
    difficulty: str = "all",
):
    """Return paginated problem list: local DB problems + alfa-leetcode-api problems."""
    local_all = list(db.problems.find({}, {"_id": 0}))
    local_ids = {p["id"] for p in local_all}

    diff_filter = difficulty.lower() if difficulty != "all" else None
    if diff_filter:
        local_filtered = [p for p in local_all if p["difficulty"].lower() == diff_filter]
    else:
        local_filtered = local_all

    lc_raw = await fetch_problem_list(limit=200)
    lc_filtered = [
        p for p in lc_raw
        if not p.get("isPaidOnly")
        and p["titleSlug"] not in local_ids
        and (diff_filter is None or p["difficulty"].lower() == diff_filter)
    ]

    combined = (
        [_local_to_list_item(p) for p in local_filtered]
        + [_lc_to_list_item(p) for p in lc_filtered]
    )
    total = len(combined)
    return ProblemListResponse(problems=combined[skip: skip + limit], total=total)


@router.get("/{slug}", response_model=ProblemDetail)
async def get_problem(slug: str):
    """Return full problem detail: DB first, then alfa-leetcode-api."""
    local = db.problems.find_one({"id": slug}, {"_id": 0})
    if local:
        return _local_to_detail(local)

    detail = await fetch_problem_detail(slug)
    if not detail:
        raise HTTPException(status_code=404, detail="Problem not found")
    return _lc_to_detail(detail)
