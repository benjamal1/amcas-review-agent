#!/usr/bin/env python3
"""
Import school list from CSV → one Obsidian note per school.
Usage: python3 "School List/MSAR/import_csv.py" /path/to/tracker.csv
Run from inside the vault directory on Mac.
Output: School List/Schools/[School Name].md
"""

import csv
import difflib
import json
import re
import sys
from pathlib import Path

MSAR_JSON   = Path(__file__).parent / "msar-lookup.json"
SCHOOLS_DIR = Path(__file__).parent.parent / "Schools"

# CSV column indices (0-based): Rank,State,School,PREview,CASPer,GPA,MCAT,LOR,
# Other Requirements,Merit Aid,Financial Aid,Primary Submitted,...
COL = {
    "school":    2,
    "preview":   3,
    "casper":    4,
    "gpa":       5,
    "mcat":      6,
    "lor":       7,
    "merit_aid": 9,
    "financial": 10,
}


def load_msar() -> dict:
    if not MSAR_JSON.exists():
        print(f"ERROR: {MSAR_JSON} not found. Run extract_msar.py first.")
        sys.exit(1)
    return json.loads(MSAR_JSON.read_text())


def _clean_keys(msar: dict) -> dict:
    """Filter out malformed OCR artifact keys from the MSAR lookup."""
    BAD_PATTERNS = re.compile(
        r'The record|We will|We accept|Pass.?[Ff]ail|Required|AP credit|=\||^\|',
        re.IGNORECASE
    )
    return {k: v for k, v in msar.items() if not BAD_PATTERNS.search(k) and len(k) > 10}


def match_school(csv_name: str, msar: dict):
    """Return (msar_key, msar_entry) or (None, {})."""
    clean = _clean_keys(msar)
    if csv_name in clean:
        return csv_name, clean[csv_name]
    keys = list(clean.keys())
    # Higher cutoff to avoid wrong-state matches (e.g. Ohio→Florida State)
    matches = difflib.get_close_matches(csv_name, keys, n=1, cutoff=0.7)
    if matches:
        return matches[0], clean[matches[0]]
    # First-word fallback for abbreviations (UCSF, WashU, UPitt, etc.)
    # Only apply if csv_name is itself short/abbreviated (≤10 chars) — avoids "Ohio" → "Northeast Ohio"
    if len(csv_name) <= 10:
        first = csv_name.split()[0].lower()
        for k in keys:
            if first in k.lower() and len(first) > 3:
                return k, clean[k]
    return None, {}


def parse_lor(lor_field: str):
    """Parse '3-6, 2 science 1 non science' → (min, max, notes)."""
    m = re.match(r'(\d+)[-–](\d+)', lor_field)
    if m:
        return int(m.group(1)), int(m.group(2)), lor_field
    m = re.match(r'^(\d+)', lor_field)
    if m:
        n = int(m.group(1))
        return n, n, lor_field
    return "", "", lor_field


def course_table(courses: list) -> str:
    if not courses:
        return "| Course | Status | Notes |\n|--------|--------|-------|"
    rows = ["| Course | Status | Notes |", "|--------|--------|-------|"]
    for c in courses:
        notes = c.get("notes", "").replace("|", "\\|")[:120]
        rows.append(f"| {c['name']} | {c['status']} | {notes} |")
    return "\n".join(rows)


def safe_filename(name: str) -> str:
    return re.sub(r'[<>:"/\\|?*]', '', name).strip() + ".md"


def b(val) -> str:
    return "true" if val else "false"


def build_note(csv_row: dict, msar_key, msar_entry: dict) -> str:
    name  = msar_key or csv_row["school"]
    state = msar_entry.get("state", "")
    loe   = msar_entry.get("loe", {})
    iv    = msar_entry.get("interview", {})
    prev  = msar_entry.get("preview", {})
    adm   = msar_entry.get("admission_notes", "")
    crs   = msar_entry.get("courses", [])

    loe_min, loe_max, loe_notes = parse_lor(csv_row.get("lor", ""))
    preview_req = prev.get("required", csv_row.get("preview", "").lower() == "yes")
    casper_req  = csv_row.get("casper", "").lower() == "yes"

    return f"""---
component: school
school_name: {name}
state: {state}
tier: unknown

avg_gpa: {csv_row.get("gpa", "")}
avg_mcat: {csv_row.get("mcat", "")}

preview_required: {b(preview_req)}
preview_note: "{prev.get('note', '')[:200].replace('"', "'")}"
preview_completed: false
casper_required: {b(casper_req)}
casper_completed: false

loe_committee_letter: {loe.get("committee_letter", "unknown")}
loe_letter_packet: {loe.get("letter_packet", "unknown")}
loe_individual_letters: {loe.get("individual_letters", "unknown")}
loe_min: {loe_min}
loe_max: {loe_max}
loe_notes: "{loe_notes}"

interview_type: "{iv.get('type', '').replace('"', "'")}"
interview_season_start: "{iv.get('season_start', '')}"

admission_notes: "{adm[:300].replace('"', "'")}"

primary_submitted: false
secondary_requested: false
secondary_due: ""
secondary_submitted: false
interview_invited: false
interview_date: ""
decision: ""
merit_aid: {b(csv_row.get("merit_aid", ""))}
financial_aid: {b(csv_row.get("financial", ""))}

letters_sent: 0
courses_verified: false
courses_missing: []
---

## Course Requirements

{course_table(crs)}

## Admission Notes

> {adm[:500].replace('"', "'") if adm else "See school website for full admissions policies."}
"""


def main():
    if len(sys.argv) < 2:
        print("Usage: python3 import_csv.py /path/to/tracker.csv")
        sys.exit(1)

    csv_path = Path(sys.argv[1]).expanduser()
    if not csv_path.exists():
        print(f"ERROR: {csv_path} not found")
        sys.exit(1)

    msar = load_msar()
    SCHOOLS_DIR.mkdir(parents=True, exist_ok=True)

    created, skipped, unmatched = 0, 0, []

    with open(csv_path, newline="", encoding="utf-8-sig") as f:
        reader = csv.reader(f)
        next(reader)  # skip header
        for row in reader:
            if len(row) <= COL["school"]:
                continue
            csv_name = row[COL["school"]].strip()
            if not csv_name:
                continue

            csv_data = {
                "school":    csv_name,
                "preview":   row[COL["preview"]].strip() if len(row) > COL["preview"] else "",
                "casper":    row[COL["casper"]].strip()  if len(row) > COL["casper"]  else "",
                "gpa":       row[COL["gpa"]].strip()     if len(row) > COL["gpa"]     else "",
                "mcat":      row[COL["mcat"]].strip()    if len(row) > COL["mcat"]    else "",
                "lor":       row[COL["lor"]].strip()     if len(row) > COL["lor"]     else "",
                "merit_aid": row[COL["merit_aid"]].strip() if len(row) > COL["merit_aid"] else "",
                "financial": row[COL["financial"]].strip() if len(row) > COL["financial"] else "",
            }

            msar_key, msar_entry = match_school(csv_name, msar)
            if not msar_key:
                unmatched.append(csv_name)

            out_path = SCHOOLS_DIR / safe_filename(msar_key or csv_name)
            if out_path.exists():
                print(f"  SKIP (exists): {out_path.name}")
                skipped += 1
                continue

            out_path.write_text(build_note(csv_data, msar_key, msar_entry))
            label = f"→ {msar_key}" if msar_key and msar_key != csv_name else "(matched)"
            print(f"  ✓ {csv_name} {label}")
            created += 1

    print(f"\nDone: {created} created, {skipped} skipped")
    if unmatched:
        print("Unmatched (MSAR fields left blank — verify these manually):")
        for n in unmatched:
            print(f"  ! {n}")


if __name__ == "__main__":
    main()
