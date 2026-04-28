import pytest
from services.test_case_extractor import parse_test_cases_from_api

TWO_SUM_STDIN = "[2,7,11,15]\n9\n[3,2,4]\n6\n[3,3]\n6"
TWO_SUM_HTML = """
<p>Example 1:</p>
<pre>
<strong>Input:</strong> nums = [2,7,11,15], target = 9
<strong>Output:</strong> [0,1]
<strong>Explanation:</strong> Because nums[0] + nums[1] == 9, we return [0, 1].
</pre>
<p>Example 2:</p>
<pre>
<strong>Input:</strong> nums = [3,2,4], target = 6
<strong>Output:</strong> [1,2]
</pre>
<p>Example 3:</p>
<pre>
<strong>Input:</strong> nums = [3,3], target = 6
<strong>Output:</strong> [0,1]
</pre>
"""

REGEX_STDIN = '"aa"\n"a"\n"aa"\n"a*"\n"ab"\n".*"'
REGEX_HTML = """
<pre>
<strong>Input:</strong> s = &quot;aa&quot;, p = &quot;a&quot;
<strong>Output:</strong> false
</pre>
<pre>
<strong>Input:</strong> s = &quot;aa&quot;, p = &quot;a*&quot;
<strong>Output:</strong> true
</pre>
<pre>
<strong>Input:</strong> s = &quot;ab&quot;, p = &quot;.*&quot;
<strong>Output:</strong> true
</pre>
"""


def test_parse_two_sum_examples():
    cases = parse_test_cases_from_api(TWO_SUM_STDIN, TWO_SUM_HTML)
    assert len(cases) == 3
    assert cases[0]["stdin"] == "[2,7,11,15]\n9"
    assert cases[0]["expected_stdout"] == "[0,1]"
    assert cases[1]["stdin"] == "[3,2,4]\n6"
    assert cases[1]["expected_stdout"] == "[1,2]"
    assert cases[2]["stdin"] == "[3,3]\n6"
    assert cases[2]["expected_stdout"] == "[0,1]"
    assert all(c["is_hidden"] is False for c in cases)
    assert all("id" in c for c in cases)


def test_parse_regex_examples():
    cases = parse_test_cases_from_api(REGEX_STDIN, REGEX_HTML)
    assert len(cases) == 3
    assert cases[0]["stdin"] == '"aa"\n"a"'
    assert cases[0]["expected_stdout"] == "false"
    assert cases[1]["expected_stdout"] == "true"
    assert cases[2]["expected_stdout"] == "true"


def test_returns_empty_on_missing_data():
    assert parse_test_cases_from_api("", TWO_SUM_HTML) == []
    assert parse_test_cases_from_api(TWO_SUM_STDIN, "") == []
    assert parse_test_cases_from_api("", "") == []


def test_returns_empty_when_count_mismatch():
    # TWO_SUM_STDIN has 6 lines; 4 outputs → 6 % 4 != 0, so mismatch
    html_4 = """
    <pre><strong>Output:</strong> [0,1]</pre>
    <pre><strong>Output:</strong> [1,2]</pre>
    <pre><strong>Output:</strong> [0,1]</pre>
    <pre><strong>Output:</strong> [0,1]</pre>
    """
    result = parse_test_cases_from_api(TWO_SUM_STDIN, html_4)
    assert result == []
