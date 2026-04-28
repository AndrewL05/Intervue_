import json
import logging
from pathlib import Path

from db import db

logger = logging.getLogger(__name__)

_PROBLEMS_PATH = Path(__file__).parent.parent / "problems" / "problems.json"


def seed_problems() -> None:
    """Seed problems collection from problems.json if the collection is empty."""
    if db.problems.count_documents({}) > 0:
        return

    try:
        with open(_PROBLEMS_PATH, encoding="utf-8") as f:
            problems = json.load(f)
    except (OSError, json.JSONDecodeError) as exc:
        logger.exception("Failed to load problems from %s", _PROBLEMS_PATH)
        raise

    db.problems.insert_many(problems)
    logger.info("Seeded %d problems into MongoDB", len(problems))
