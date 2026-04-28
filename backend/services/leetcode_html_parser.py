import html
import re

from services.html_utils import strip_html


def parse_question_html(raw_html: str) -> dict:
    """Parse LeetCode question HTML into structured description, examples, constraints.

    Returns:
        {
            "description": str,
            "examples": [{"input": str, "output": str, "explanation": str | None}],
            "constraints": [str],
        }
    """
    if not raw_html:
        return {"description": "", "examples": [], "constraints": []}

    examples = _extract_examples(raw_html)
    constraints = _extract_constraints(raw_html)
    description = _extract_description(raw_html)

    return {"description": description, "examples": examples, "constraints": constraints}


def _extract_examples(decoded: str) -> list[dict]:
    """Extract examples from <pre> blocks that follow an 'Example N:' heading."""
    examples = []

    # Anchor to only <pre> blocks that follow an Example N: heading
    pattern = r'<strong[^>]*>\s*Example\s+\d+.*?</strong>.*?<pre>(.*?)</pre>'
    pre_blocks = re.findall(pattern, decoded, re.DOTALL | re.IGNORECASE)

    for block in pre_blocks:
        # Strip HTML tags within the pre block
        clean = re.sub(r"<[^>]+>", "", block)
        clean = html.unescape(clean).strip()

        # Must have both Input: and Output: to be a valid example
        input_match = re.search(r"Input:\s*(.+?)(?=Output:|$)", clean, re.DOTALL)
        output_match = re.search(r"Output:\s*(.+?)(?=Explanation:|$)", clean, re.DOTALL)
        if not input_match or not output_match:
            continue

        input_val = input_match.group(1).strip()
        output_val = output_match.group(1).strip()

        explanation = None
        expl_match = re.search(r"Explanation:\s*(.+?)$", clean, re.DOTALL)
        if expl_match:
            explanation = expl_match.group(1).strip()

        examples.append({
            "input": input_val,
            "output": output_val,
            "explanation": explanation,
        })

    return examples


def _extract_constraints(decoded: str) -> list[str]:
    """Extract constraint strings from the <ul> after 'Constraints:'."""
    constraints = []

    # Find the constraints section
    constraints_match = re.search(
        r"<strong[^>]*>\s*Constraints:?\s*</strong>.*?<ul>(.*?)</ul>",
        decoded,
        re.DOTALL | re.IGNORECASE,
    )
    if not constraints_match:
        return []

    ul_content = constraints_match.group(1)
    items = re.findall(r"<li[^>]*>(.*?)</li>", ul_content, re.DOTALL | re.IGNORECASE)
    for item in items:
        # Strip all HTML tags, decode entities, normalize whitespace
        clean = re.sub(r"<[^>]+>", "", item)
        clean = html.unescape(clean)
        clean = clean.replace("\xa0", " ")
        clean = re.sub(r"\s+", " ", clean).strip()
        if clean:
            constraints.append(clean)

    return constraints


def _extract_description(decoded: str) -> str:
    """Extract problem description: everything before the first Example block."""
    # Cut at the first Example heading (with class attribute)
    cut = re.split(
        r'<strong\s+class=["\']example["\']>',
        decoded,
        maxsplit=1,
        flags=re.IGNORECASE,
    )
    if len(cut) == 1:
        # Fallback: no class attribute on Example heading
        cut = re.split(
            r'<(?:strong|b)[^>]*>\s*Example\s+\d+\s*:?\s*</(?:strong|b)>',
            decoded,
            maxsplit=1,
            flags=re.IGNORECASE,
        )
    description_html = cut[0]

    # Remove the Constraints section if it appears before examples (rare)
    description_html = re.sub(
        r"<p>\s*<strong[^>]*>\s*Constraints:?\s*</strong>.*",
        "",
        description_html,
        flags=re.DOTALL | re.IGNORECASE,
    )

    return strip_html(description_html)
