import pytest
from unittest.mock import AsyncMock, MagicMock, patch

FAKE_LIST_RESP = {
    "count": 2,
    "problemsetQuestionList": [
        {"frontendQuestionId": "1", "title": "Two Sum", "titleSlug": "two-sum",
         "difficulty": "Easy", "isPaidOnly": False,
         "topicTags": [{"name": "Array", "slug": "array"}]},
        {"frontendQuestionId": "146", "title": "LRU Cache", "titleSlug": "lru-cache",
         "difficulty": "Medium", "isPaidOnly": False,
         "topicTags": [{"name": "Design", "slug": "design"}]},
    ],
}

FAKE_DETAIL_RESP = {
    "questionId": "1",
    "title": "Two Sum",
    "titleSlug": "two-sum",
    "difficulty": "Easy",
    "content": "<p>Given an array of integers <code>nums</code>.</p><p>Return indices.</p>",
    "topicTags": [{"name": "Array", "slug": "array"}],
    "codeSnippets": [
        {"lang": "Python3", "langSlug": "python3", "code": "class Solution:\n    pass"},
    ],
    "hints": ["Use a hash map."],
}


@pytest.mark.asyncio
async def test_fetch_problem_list_returns_items():
    mock_resp = MagicMock()
    mock_resp.raise_for_status = MagicMock()
    mock_resp.json.return_value = FAKE_LIST_RESP

    with patch("httpx.AsyncClient") as mock_cls:
        mock_http = AsyncMock()
        mock_http.get.return_value = mock_resp
        mock_cls.return_value.__aenter__ = AsyncMock(return_value=mock_http)
        mock_cls.return_value.__aexit__ = AsyncMock(return_value=False)

        from services import leetcode_client
        leetcode_client._list_cache = None
        leetcode_client._list_cache_at = 0.0

        items = await leetcode_client.fetch_problem_list(limit=100)

    assert len(items) == 2
    assert items[0]["titleSlug"] == "two-sum"
    assert items[1]["difficulty"] == "Medium"


@pytest.mark.asyncio
async def test_fetch_problem_list_uses_cache_on_second_call():
    mock_resp = MagicMock()
    mock_resp.raise_for_status = MagicMock()
    mock_resp.json.return_value = FAKE_LIST_RESP

    with patch("httpx.AsyncClient") as mock_cls:
        mock_http = AsyncMock()
        mock_http.get.return_value = mock_resp
        mock_cls.return_value.__aenter__ = AsyncMock(return_value=mock_http)
        mock_cls.return_value.__aexit__ = AsyncMock(return_value=False)

        from services import leetcode_client
        leetcode_client._list_cache = None
        leetcode_client._list_cache_at = 0.0

        await leetcode_client.fetch_problem_list()
        await leetcode_client.fetch_problem_list()

    assert mock_http.get.call_count == 1


@pytest.mark.asyncio
async def test_fetch_problem_detail_strips_html():
    mock_resp = MagicMock()
    mock_resp.raise_for_status = MagicMock()
    mock_resp.json.return_value = FAKE_DETAIL_RESP

    with patch("httpx.AsyncClient") as mock_cls:
        mock_http = AsyncMock()
        mock_http.get.return_value = mock_resp
        mock_cls.return_value.__aenter__ = AsyncMock(return_value=mock_http)
        mock_cls.return_value.__aexit__ = AsyncMock(return_value=False)

        from services import leetcode_client
        leetcode_client._detail_cache.clear()
        leetcode_client._detail_cache_at.clear()

        detail = await leetcode_client.fetch_problem_detail("two-sum")

    assert detail is not None
    assert "<p>" not in detail["description"]
    assert "Given an array of integers" in detail["description"]
    assert detail["topic_tags"] == ["Array"]


@pytest.mark.asyncio
async def test_fetch_problem_detail_returns_none_on_error():
    with patch("httpx.AsyncClient") as mock_cls:
        mock_http = AsyncMock()
        mock_http.get.side_effect = Exception("network error")
        mock_cls.return_value.__aenter__ = AsyncMock(return_value=mock_http)
        mock_cls.return_value.__aexit__ = AsyncMock(return_value=False)

        from services import leetcode_client
        leetcode_client._detail_cache.clear()
        leetcode_client._detail_cache_at.clear()

        detail = await leetcode_client.fetch_problem_detail("nonexistent-slug")

    assert detail is None


def test_strip_html_preserves_text_and_newlines():
    from services.html_utils import strip_html
    result = strip_html("<p>Hello <strong>world</strong>.</p><p>Line two.</p>")
    assert "Hello world." in result
    assert "Line two." in result
    assert "<" not in result


@pytest.mark.asyncio
async def test_fetch_problem_list_returns_stale_cache_on_network_error():
    stale = [{"titleSlug": "two-sum", "difficulty": "Easy", "isPaidOnly": False, "topicTags": []}]

    with patch("httpx.AsyncClient") as mock_cls:
        mock_http = AsyncMock()
        mock_http.get.side_effect = Exception("network error")
        mock_cls.return_value.__aenter__ = AsyncMock(return_value=mock_http)
        mock_cls.return_value.__aexit__ = AsyncMock(return_value=False)

        from services import leetcode_client
        leetcode_client._list_cache = stale
        leetcode_client._list_cache_at = 0.0  # expired, so a fresh fetch is attempted

        result = await leetcode_client.fetch_problem_list()

    assert result == stale
