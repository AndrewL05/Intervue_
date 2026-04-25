from pydantic import BaseModel


class ProblemListItem(BaseModel):
    slug: str
    title: str
    difficulty: str        # "easy", "medium", "hard"
    source: str            # "local" or "leetcode"
    has_test_cases: bool
    topic_tags: list[str]


class ProblemListResponse(BaseModel):
    problems: list[ProblemListItem]
    total: int


class ProblemExample(BaseModel):
    input: str
    output: str
    explanation: str | None = None


class ProblemDetail(BaseModel):
    slug: str
    title: str
    difficulty: str
    source: str
    has_test_cases: bool
    description: str
    examples: list[ProblemExample]
    constraints: list[str]
    topic_tags: list[str]
    starter_code: dict[str, str] | None = None
    hints: list[str] = []
