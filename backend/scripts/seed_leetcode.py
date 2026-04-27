"""Offline batch script: seed all free LeetCode problems into MongoDB.

Run from backend/ with the virtualenv active:
    python scripts/seed_leetcode.py
    python scripts/seed_leetcode.py --limit 20
    python scripts/seed_leetcode.py --dry-run
    python scripts/seed_leetcode.py --force
"""
import argparse
import asyncio
import json
import logging
from pathlib import Path

logging.basicConfig(level=logging.INFO, format="%(message)s")
logger = logging.getLogger(__name__)

_MAX_API_PROBLEMS = 200  # alfa-leetcode-api /problems endpoint ceiling
FAILED_LOG = Path(__file__).parent / "seed_failed.json"


async def _process_problem(slug: str, dry_run: bool) -> str:
    """Fetch, parse, generate, and upsert one problem. Returns 'saved', 'dry_run', or 'failed:<reason>'."""
    from services.leetcode_client import fetch_problem_detail
    from services.leetcode_html_parser import parse_question_html
    from services.test_case_generator import generate_full_problem
    from db import db

    detail = await fetch_problem_detail(slug)
    if not detail:
        return "failed:no_detail"

    parsed = parse_question_html(detail.get("question_html", ""))
    description = parsed["description"] or detail.get("description", "")

    problem_input = {
        "title": detail["title"],
        "description": description,
        "examples": parsed["examples"],
        "constraints": parsed["constraints"],
    }

    if dry_run:
        return "dry_run"

    generated = await generate_full_problem(problem_input)
    if not generated:
        return "failed:llm"

    doc = {
        "id": slug,
        "title": detail["title"],
        "difficulty": detail["difficulty"].lower(),
        "description": description,
        "examples": parsed["examples"],
        "constraints": parsed["constraints"],
        "topic_tags": detail.get("topic_tags", []),
        "test_cases": generated["test_cases"],
        "starter_code": generated["starter_code"],
    }

    db.problems.update_one({"id": slug}, {"$set": doc}, upsert=True)
    return "saved"


async def main(limit: int, dry_run: bool, force: bool) -> None:
    from services.leetcode_client import fetch_problem_list
    from db import db

    logger.info("Fetching problem list from alfa-leetcode-api...")
    all_problems = await fetch_problem_list(limit=_MAX_API_PROBLEMS)
    free_problems = [p for p in all_problems if not p.get("isPaidOnly")]
    logger.info("Found %d free problems", len(free_problems))

    existing_slugs: set[str] = set()
    if not force:
        docs = db.problems.find({"test_cases": {"$exists": True}}, {"id": 1, "_id": 0})
        existing_slugs = {d["id"] for d in docs}
        logger.info("Skipping %d problems already in DB", len(existing_slugs))

    to_process = [
        p for p in free_problems
        if p["titleSlug"] not in existing_slugs
    ][:limit]

    logger.info("Processing %d problems...\n", len(to_process))

    saved = skipped = failed = dry_run_count = 0
    failures: list[dict] = []

    for i, problem in enumerate(to_process, start=1):
        slug = problem["titleSlug"]
        prefix = f"[{i}/{len(to_process)}] {slug:<45}"

        try:
            result = await _process_problem(slug, dry_run)
        except Exception as exc:
            result = f"failed:exception:{exc}"

        if result == "saved":
            logger.info("%s ✓ saved", prefix)
            saved += 1
        elif result == "dry_run":
            logger.info("%s (dry-run)", prefix)
            dry_run_count += 1
        elif result.startswith("failed"):
            reason = result.split(":", 1)[1] if ":" in result else result
            logger.warning("%s ✗ failed (%s)", prefix, reason)
            failed += 1
            failures.append({"slug": slug, "reason": reason})

        await asyncio.sleep(2.0)

    if dry_run:
        logger.info("\nDone: %d would-be-saved (dry-run), %d failed", dry_run_count, failed)
    else:
        logger.info("\nDone: %d saved, %d skipped, %d failed", saved, skipped, failed)

    if failures:
        FAILED_LOG.write_text(json.dumps(failures, indent=2))
        logger.info("Failed slugs written to %s", FAILED_LOG)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Seed LeetCode problems into MongoDB")
    parser.add_argument("--limit", type=int, default=200, help="Max problems to process")
    parser.add_argument("--dry-run", action="store_true", help="Fetch and parse but do not write to DB")
    parser.add_argument("--force", action="store_true", help="Re-generate even if problem already in DB")
    args = parser.parse_args()

    asyncio.run(main(limit=args.limit, dry_run=args.dry_run, force=args.force))
