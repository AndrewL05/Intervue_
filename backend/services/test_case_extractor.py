import html
import re


def parse_test_cases_from_api(example_testcases: str, question_html: str) -> list[dict]:
    """Extract test cases from alfa-leetcode-api example data.

    Parses exampleTestcases (raw stdin blocks) and the question HTML
    (which contains Output: lines) to build stdin/expected_stdout pairs.
    Returns [] if data is missing or counts don't match.
    """
    if not example_testcases or not question_html:
        return []

    # Extract expected outputs from HTML — match <strong>Output:</strong> value
    decoded_html = html.unescape(question_html)
    output_matches = re.findall(
        r'<(?:strong|b)[^>]*>\s*Output:?\s*</(?:strong|b)>\s*([^\n<]+)',
        decoded_html,
        re.IGNORECASE,
    )
    outputs = [html.unescape(o.strip()) for o in output_matches if o.strip()]
    if not outputs:
        return []

    # Split exampleTestcases into per-case stdin blocks
    lines = example_testcases.strip().split('\n')
    n = len(outputs)
    if n == 0 or len(lines) % n != 0:
        return []

    lines_per_case = len(lines) // n
    test_cases = []
    for i in range(n):
        stdin = '\n'.join(lines[i * lines_per_case:(i + 1) * lines_per_case])
        test_cases.append({
            "id": f"tc{i + 1}",
            "stdin": stdin,
            "expected_stdout": outputs[i],
            "is_hidden": False,
        })
    return test_cases
