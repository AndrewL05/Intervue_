import pytest
from services.leetcode_html_parser import parse_question_html

REGEX_HTML = """
<p>Given an input string <code>s</code>&nbsp;and a pattern <code>p</code>, implement regular expression matching.</p>

<p><strong class="example">Example 1:</strong></p>
<pre>
<strong>Input:</strong> s = &quot;aa&quot;, p = &quot;a&quot;
<strong>Output:</strong> false
<strong>Explanation:</strong> &quot;a&quot; does not match the entire string &quot;aa&quot;.
</pre>

<p><strong class="example">Example 2:</strong></p>
<pre>
<strong>Input:</strong> s = &quot;aa&quot;, p = &quot;a*&quot;
<strong>Output:</strong> true
</pre>

<p><strong>Constraints:</strong></p>
<ul>
\t<li><code>1 &lt;= s.length&nbsp;&lt;= 20</code></li>
\t<li><code>s</code> contains only lowercase English letters.</li>
</ul>
"""

TWO_SUM_HTML = """
<p>Given an array of integers <code>nums</code> and an integer <code>target</code>, return indices.</p>

<p><strong class="example">Example 1:</strong></p>
<pre>
<strong>Input:</strong> nums = [2,7,11,15], target = 9
<strong>Output:</strong> [0,1]
<strong>Explanation:</strong> Because nums[0] + nums[1] == 9, we return [0, 1].
</pre>

<p><strong>Constraints:</strong></p>
<ul>
\t<li><code>2 &lt;= nums.length &lt;= 10<sup>4</sup></code></li>
\t<li>Only one valid answer exists.</li>
</ul>
"""

NO_EXAMPLES_HTML = """
<p>A simple problem with no structured examples.</p>
<p><strong>Constraints:</strong></p>
<ul><li><code>1 &lt;= n &lt;= 100</code></li></ul>
"""


def test_parses_two_examples():
    result = parse_question_html(REGEX_HTML)
    assert len(result["examples"]) == 2


def test_first_example_input_output():
    result = parse_question_html(REGEX_HTML)
    ex = result["examples"][0]
    assert ex["input"] == 's = "aa", p = "a"'
    assert ex["output"] == "false"
    assert ex["explanation"] == '"a" does not match the entire string "aa".'


def test_second_example_no_explanation():
    result = parse_question_html(REGEX_HTML)
    ex = result["examples"][1]
    assert ex["input"] == 's = "aa", p = "a*"'
    assert ex["output"] == "true"
    assert ex["explanation"] is None


def test_parses_constraints():
    result = parse_question_html(REGEX_HTML)
    constraints = result["constraints"]
    assert len(constraints) >= 2
    assert any("s.length" in c for c in constraints)
    assert any("lowercase" in c for c in constraints)


def test_description_does_not_contain_example_blocks():
    result = parse_question_html(REGEX_HTML)
    assert "Example 1" not in result["description"]
    assert "Input:" not in result["description"]
    assert "Output:" not in result["description"]


def test_description_contains_problem_text():
    result = parse_question_html(TWO_SUM_HTML)
    assert "indices" in result["description"].lower()


def test_array_input_example():
    result = parse_question_html(TWO_SUM_HTML)
    ex = result["examples"][0]
    assert ex["input"] == "nums = [2,7,11,15], target = 9"
    assert ex["output"] == "[0,1]"


def test_no_examples_returns_empty_list():
    result = parse_question_html(NO_EXAMPLES_HTML)
    assert result["examples"] == []


def test_returns_all_keys():
    result = parse_question_html(REGEX_HTML)
    assert "description" in result
    assert "examples" in result
    assert "constraints" in result


def test_empty_string_returns_empty():
    result = parse_question_html("")
    assert result == {"description": "", "examples": [], "constraints": []}


def test_constraints_strip_html_tags():
    result = parse_question_html(TWO_SUM_HTML)
    for c in result["constraints"]:
        assert "<sup>" not in c
        assert "</sup>" not in c
        assert "<code>" not in c


def test_description_fallback_no_class_attribute():
    # HTML without class="example" on the Example heading
    html_no_class = """
<p>Find two numbers that add up to target.</p>
<p><strong>Example 1:</strong></p>
<pre>
<strong>Input:</strong> nums = [2,7], target = 9
<strong>Output:</strong> [0,1]
</pre>
"""
    result = parse_question_html(html_no_class)
    assert "Example 1" not in result["description"]
    assert len(result["examples"]) == 1
    assert result["examples"][0]["input"] == "nums = [2,7], target = 9"
