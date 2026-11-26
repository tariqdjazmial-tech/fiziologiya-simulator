#!/usr/bin/env bash
# Codex като проверител на реалистичността на 3D снимки (само четене).
# Употреба: design/tools/realism-review.sh <изходна папка> <снимка.png> [още снимки…]
# Codex получава еталоните (добро/лошо), рубриката и снимките; изход: <папка>/realism-out.md
# Код на изход: 0 = готово, 3 = codex липсва, 4 = не е влязъл, 5 = codex се провали, 2 = грешна употреба
set -u
OUT="${1:-}"; shift || true
[ -z "$OUT" ] || [ "$#" -lt 1 ] && { echo "Употреба: $0 <изходна папка> <снимка.png> [още…]"; exit 2; }
ROOT="$(git rev-parse --show-toplevel 2>/dev/null)" || { echo "Не е git репо"; exit 2; }
REF="$ROOT/design/reference/realism"
CODEX="$(command -v codex || true)"
[ -z "$CODEX" ] && { echo "CODEX_MISSING"; exit 3; }
"$CODEX" login status >/dev/null 2>&1 || { echo "CODEX_NOT_LOGGED_IN"; exit 4; }
mkdir -p "$OUT"
IMGS=(-i "$REF/good_ecg_heart.png" -i "$REF/bad_cardio_v1.png" -i "$REF/target_organs_infinytech.png")
for f in "$REF"/good_*.png; do [ "$f" != "$REF/good_ecg_heart.png" ] && IMGS+=(-i "$f"); done
NAMES=""; for f in "$@"; do IMGS+=(-i "$f"); NAMES="$NAMES $(basename "$f")"; done
{
cat <<EOF
You are a senior 3D medical-visualization art director. Judge REALISM of WebGL scenes of a physiology teaching app.
Attached images, in order: (1) GOOD reference good_ecg_heart.png (score 7 = minimum pass), (2) BAD reference bad_cardio_v1.png, (3) TARGET target_organs_infinytech.png (score 10), then any other good_*.png references, then the CANDIDATE screenshots:${NAMES}.
Use this rubric (Bulgarian, authoritative):

EOF
cat "$REF/RUBRIC.md"
cat <<'EOF'

For EACH candidate image output Markdown:
### <file name> — PASS|FAIL (average X.X)
| # | criterion | score 0–10 | evidence (what you see) |
then "Fixes" — up to 6 concrete, actionable changes (material params, lighting, which model from site/m to use, what to remove), most impactful first.
Finish with "## Verdict" (one paragraph) comparing candidates to the GOOD reference. Be strict: plastic-looking flat colours, neon outlines, candy-like particles, hollow cut shells and arbitrary organ colours are FAIL.
Answer in Bulgarian. Do not modify any files.
EOF
} > "$OUT/realism-prompt.md"
"$CODEX" exec -s read-only --skip-git-repo-check "${IMGS[@]}" -o "$OUT/realism-out.md" - < "$OUT/realism-prompt.md" > "$OUT/realism-log.txt" 2>&1 || { echo "CODEX_FAILED (виж $OUT/realism-log.txt)"; exit 5; }
echo "OK → $OUT/realism-out.md"
