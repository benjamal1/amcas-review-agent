#!/usr/bin/env python3
"""
MSAR PDF extractor — run on Mac from anywhere in the vault.
Usage: python3 "School List/MSAR/extract_msar.py" [--pdf-dir ~/Downloads/MSAR]
Output: School List/MSAR/msar-lookup.json (next to this script)
"""

import json
import re
import argparse
import difflib
from collections import Counter
from pathlib import Path

from pdf2image import convert_from_path
import pytesseract

POPPLER_PATH = "/opt/homebrew/bin"
TESSERACT_CMD = "/opt/homebrew/bin/tesseract"
pytesseract.pytesseract.tesseract_cmd = TESSERACT_CMD

DEFAULT_PDF_DIR = Path.home() / "Downloads" / "MSAR"
OUTPUT_PATH = Path(__file__).parent / "msar-lookup.json"

PDFS = {
    "loe":       "MSAR011 - MSAR Letter of Evaluation Preferences.pdf",
    "courses":   "MSAR002 - MSAR Premed Course Requirements.pdf",
    "interview": "MSAR008 - MSAR Interview Procedures.pdf",
    "admission": "MSAR018 - MSAR Admission Policies and Information.pdf",
    "preview":   "MSAR_PREview Participation_06.09.25 04152026 SC.pdf",
}

US_STATES = {
    "AL","AK","AZ","AR","CA","CO","CT","DC","DE","FL","GA","HI","ID",
    "IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO",
    "MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA",
    "RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY",
}


def ocr_pdf_pages(pdf_path: Path, dpi: int = 200) -> list:
    """Return list of OCR text strings, one per page."""
    pages = convert_from_path(str(pdf_path), dpi=dpi, poppler_path=POPPLER_PATH)
    return [pytesseract.image_to_string(p) for p in pages]


def extract_page_legend(text: str) -> dict:
    """
    Parse per-page LOE legend to map OCR symbol characters to
    'preferred', 'accepted', or 'not_accepted'.

    Legend always appears near top of each page:
        SYMBOL : Accepted
        SYMBOL : Preferred
        SYMBOL : Not Accepted
    """
    legend = {}
    for value, key in [
        ("Not Accepted", "not_accepted"),
        ("Preferred", "preferred"),
        ("Accepted", "accepted"),
    ]:
        pattern = r'([^\s:]+)\s*:\s*' + re.escape(value)
        m = re.search(pattern, text)
        if m:
            raw = m.group(1).strip().rstrip(":")
            legend[raw] = key
    return legend


def normalize_loe_symbol(raw: str, legend: dict) -> str:
    """Map an OCR-extracted cell character to preferred/accepted/not_accepted."""
    raw = raw.strip()
    if raw in legend:
        return legend[raw]
    # Step 1: explicit character heuristics (before legend fuzzy match)
    raw_lower = raw.lower()
    if any(c in raw for c in ('/', '7', 'v', '✓')):
        return "accepted"
    if any(c in raw for c in ('>', '●', '○')):
        return "preferred"
    if any(c in raw_lower for c in ('x', '€', '@')):
        return "not_accepted"
    # Step 2: try legend exact-match (already done above) then return unknown
    return "unknown"


def clean_school_name(name: str) -> str:
    """Strip OCR artifacts from school names."""
    # Strip leading OCR noise characters (pipe, underscore, slash, brace) and whitespace
    name = re.sub(r'^[|/_{\s]+', '', name).strip()
    # Strip everything from the first bare pipe (OCR column separator) onward
    name = re.sub(r'\s*\|.*$', '', name)
    # Strip after interview/course keywords
    name = re.sub(
        r'\s+(One-on-one|scheduled|Pass[/-]?[Ff]ail|Required|Recommended|'
        r'AP credit|We accept|We will|Exploring|Not using|selectively|'
        r'Interviews|Interview|Virtual|Hybrid|MMI|Multiple Mini|Applicants|'
        r'Information|https?://|Secondary)\b.*$',
        '', name, flags=re.IGNORECASE
    )
    # Strip trailing numbers and isolated words that aren't school name parts
    name = re.sub(r'\s+\d+\s*$', '', name)
    return name.strip()[:100]


def parse_loe_row(line: str, legend: dict) -> dict:
    """
    Parse one LOE table row: 'STATE [|] School Name SYM SYM SYM'
    Returns dict or None if line doesn't match.
    """
    line = line.strip().replace("|", " ")
    m = re.match(r'^([A-Z]{2})\s+(.+)$', line)
    if not m or m.group(1) not in US_STATES:
        return None

    tokens = m.group(2).split()
    if len(tokens) < 4:
        return None

    symbols = tokens[-3:]
    name = " ".join(tokens[:-3])

    # Skip column header rows
    if any(w in name for w in ("Medical Sc", "Letter Packets", "Comittee", "Committee")):
        return None

    return {
        "name": clean_school_name(name),
        "state": m.group(1),
        "loe": {
            "committee_letter":   normalize_loe_symbol(symbols[0], legend),
            "letter_packet":      normalize_loe_symbol(symbols[1], legend),
            "individual_letters": normalize_loe_symbol(symbols[2], legend),
        },
    }


def extract_loe(pdf_path: Path) -> dict:
    """Extract LOE preferences for all schools."""
    print(f"  OCR-ing {pdf_path.name}...")
    pages_text = ocr_pdf_pages(pdf_path)
    print(f"    ({len(pages_text)} pages)")
    results = {}

    for page_text in pages_text:
        legend = extract_page_legend(page_text)
        if not legend:
            continue

        page_rows = []
        for line in page_text.splitlines():
            row = parse_loe_row(line, legend)
            if row:
                page_rows.append(row)

        # Per-page frequency fallback: if all LOE symbols on this page are unknown,
        # run frequency analysis — most common raw col-1 token → accepted, etc.
        all_unknown = page_rows and all(
            all(v == "unknown" for v in r["loe"].values()) for r in page_rows
        )
        if all_unknown:
            print(f"    [warn] page {pages_text.index(page_text) + 1}: legend missing, using frequency fallback")
            raw_syms = []
            for line in page_text.splitlines():
                line2 = line.strip().replace("|", " ")
                m = re.match(r'^([A-Z]{2})\s+(.+)$', line2)
                if m and m.group(1) in US_STATES:
                    tokens = m.group(2).split()
                    if len(tokens) >= 4:
                        raw_syms.append(tokens[-3])  # committee letter column
            if raw_syms:
                freq = Counter(raw_syms).most_common()
                # Map by frequency rank: most common→accepted, 2nd→preferred, 3rd→not_accepted
                synthetic_legend = {sym: val for sym, val in zip(
                    [s for s, _ in freq],
                    ["accepted", "preferred", "not_accepted"]
                )}
                # Re-parse this page with the synthetic legend
                page_rows = []
                for line in page_text.splitlines():
                    row = parse_loe_row(line, synthetic_legend)
                    if row:
                        page_rows.append(row)

        for row in page_rows:
            results[row["name"]] = {
                "state": row["state"],
                "loe": row["loe"],
            }

    print(f"    -> extracted LOE for {len(results)} schools")
    return results


def _match_school(name: str, data: dict):
    """Find closest existing key in data for a given school name."""
    name = clean_school_name(name)
    keys = list(data.keys())
    if not keys:
        return None
    matches = difflib.get_close_matches(name, keys, n=1, cutoff=0.6)
    return matches[0] if matches else None


def extract_courses(pdf_path: Path) -> dict:
    """Extract course requirements per school from MSAR002."""
    print(f"  OCR-ing {pdf_path.name} (219 pages — ~5 min)...")
    pages_text = ocr_pdf_pages(pdf_path)

    results = {}
    current_school = None

    SKIP_PATTERNS = [
        r"Medical School\s+Course\s+Class",
        r"Required or\s+Recommended",
        r"Association of American Medical Colleges",
        r"©\s*20\d\d",
        r"^\s*$",
    ]

    for page_text in pages_text:
        for line in page_text.splitlines():
            line = line.strip()
            if any(re.search(p, line) for p in SKIP_PATTERNS):
                continue

            # New school: starts with state code and has no course category code
            state_match = re.match(r'^([A-Z]{2})\s+(.+)', line)
            if state_match and state_match.group(1) in US_STATES:
                rest = state_match.group(2).strip()
                if not re.search(r'\b[A-Z]{3,4}\b', rest):
                    current_school = clean_school_name(rest)
                    results.setdefault(current_school, [])
                    continue

            # Course row: name + category code + Required/Recommended
            course_match = re.match(
                r'^(.+?)\s+([A-Z]{3,4})\s+(Required|Recommended)\s*(.*)', line
            )
            if course_match and current_school:
                results[current_school].append({
                    "name":   course_match.group(1).strip(),
                    "status": course_match.group(3).strip(),
                    "notes":  course_match.group(4).strip(),
                })

    print(f"    -> extracted courses for {len(results)} schools")
    return results


def extract_interview(pdf_path: Path) -> dict:
    """Extract interview type and season start per school from MSAR008."""
    print(f"  OCR-ing {pdf_path.name}...")
    pages_text = ocr_pdf_pages(pdf_path)
    results = {}

    for page_text in pages_text:
        lines = [line.strip() for line in page_text.splitlines() if line.strip()]
        for i, line in enumerate(lines):
            m = re.match(r'^([A-Z]{2})\s+(.+)', line)
            if not m or m.group(1) not in US_STATES:
                continue
            school = clean_school_name(m.group(2).strip())
            context = " ".join(lines[i:i+4])
            season_match = re.search(
                r'(Early|Mid|Late)?\s*(January|February|March|April|May|June|July|'
                r'August|September|October|November|December)',
                context
            )
            season = season_match.group(0).strip() if season_match else ""
            type_line = lines[i+1] if i+1 < len(lines) else ""
            interview_type = type_line if type_line and not re.match(r'^[A-Z]{2}\s', type_line) else ""
            results[school] = {
                "interview": {"type": interview_type, "season_start": season}
            }

    print(f"    -> extracted interview data for {len(results)} schools")
    return results


def extract_admission(pdf_path: Path) -> dict:
    """Extract admission policy notes per school from MSAR018."""
    print(f"  OCR-ing {pdf_path.name}...")
    pages_text = ocr_pdf_pages(pdf_path)
    results = {}

    current_school = None
    notes_lines = []

    for page_text in pages_text:
        lines = [line.strip() for line in page_text.splitlines() if line.strip()]

        for line in lines:
            m = re.match(r'^([A-Z]{2})\s+(.+)', line)
            if m and m.group(1) in US_STATES:
                if current_school and notes_lines:
                    results[current_school] = {"admission_notes": " ".join(notes_lines)}
                current_school = clean_school_name(m.group(2).strip())
                notes_lines = []
            elif current_school:
                if "Association of American Medical Colleges" in line or line.startswith("©"):
                    continue
                notes_lines.append(line)

    # Flush the last school after all pages
    if current_school and notes_lines:
        results[current_school] = {"admission_notes": " ".join(notes_lines)}

    print(f"    -> extracted admission notes for {len(results)} schools")
    return results


def extract_preview(pdf_path: Path) -> dict:
    """Extract PREview participation per school."""
    print(f"  OCR-ing {pdf_path.name}...")
    pages_text = ocr_pdf_pages(pdf_path, dpi=150)
    results = {}

    POLICY_KEYWORDS = re.compile(
        r'(We are|We will|Exploring|Not using|Recommending|recommending|'
        r'not using|not require|will not|using.*scores|PREview)', re.IGNORECASE
    )

    for page_text in pages_text:
        # PREview PDF is free-form text, not a table — scan for school name + policy pairs
        # Format: "School Name [policy text]" on one long line or across 2-3 lines
        text = page_text.replace("\n", " ")
        # Split on capitalized school-name-like boundaries
        # Match any sequence ending with School/Medicine/College/University that precedes a policy keyword
        segments = re.split(
            r'(?=(?:[A-Z][A-Za-z]*\s+){1,6}(?:School|Medicine|College|University)\s+(?:of\s+)?(?:Medicine\s+)?(?:We|Exploring|Not|Recommending))',
            text
        )
        for seg in segments:
            seg = seg.strip()
            if not seg or len(seg) < 20:
                continue
            # Find where the policy text starts
            policy_match = POLICY_KEYWORDS.search(seg)
            if not policy_match:
                continue
            school = clean_school_name(seg[:policy_match.start()])
            if not school or len(school) < 5:
                continue
            note = seg[policy_match.start():policy_match.start()+200].strip()
            required = bool(re.search(r'recommend|require|using.*scores', note, re.I)) and \
                       not bool(re.search(r'not using|not require|will not', note, re.I))
            results[school] = {"preview": {"required": required, "note": note}}

    print(f"    -> extracted PREview data for {len(results)} schools")
    return results


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--pdf-dir", default=str(DEFAULT_PDF_DIR))
    args = parser.parse_args()
    pdf_dir = Path(args.pdf_dir).expanduser()

    missing = [name for name in PDFS.values() if not (pdf_dir / name).exists()]
    if missing:
        print(f"ERROR: missing PDFs in {pdf_dir}:")
        for name in missing:
            print(f"  - {name}")
        raise SystemExit(1)

    data = {}

    # LOE
    print("Extracting LOE preferences...")
    for school, info in extract_loe(pdf_dir / PDFS["loe"]).items():
        data.setdefault(school, {"state": info["state"]})
        data[school]["loe"] = info["loe"]

    # Courses
    print("Extracting course requirements (slow — ~5 min)...")
    for school, courses in extract_courses(pdf_dir / PDFS["courses"]).items():
        matched = _match_school(school, data)
        data.setdefault(matched or school, {})["courses"] = courses

    # Interview
    print("Extracting interview procedures...")
    for school, info in extract_interview(pdf_dir / PDFS["interview"]).items():
        matched = _match_school(school, data)
        data.setdefault(matched or school, {}).update(info)

    # Admission policies
    print("Extracting admission policies...")
    for school, info in extract_admission(pdf_dir / PDFS["admission"]).items():
        matched = _match_school(school, data)
        data.setdefault(matched or school, {}).update(info)

    # PREview
    print("Extracting PREview participation...")
    for school, info in extract_preview(pdf_dir / PDFS["preview"]).items():
        matched = _match_school(school, data)
        data.setdefault(matched or school, {}).update(info)

    OUTPUT_PATH.write_text(json.dumps(data, indent=2))
    print(f"\nDone. Wrote {len(data)} schools -> {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
