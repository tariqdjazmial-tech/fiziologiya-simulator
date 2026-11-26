#!/usr/bin/env bash
# Независим преглед с Codex (само четене) на промените спрямо <база>.
# Употреба: design/tools/codex-review.sh <база: commit|HEAD~1> <изходна папка> [фокус: напр. "site/js/sections/cardio*.js"]
# Изход: <папка>/codex-prompt.md, <папка>/codex-out.md (последното съобщение на Codex), <папка>/codex-log.txt
# Код на изход: 0 = готово, 3 = codex липсва, 4 = не е влязъл, 5 = codex се провали, 2 = грешна употреба
set -u
BASE="${1:-}"; OUT="${2:-}"; FOCUS="${3:-}"
[ -z "$BASE" ] || [ -z "$OUT" ] && { echo "Употреба: $0 <база> <изходна папка> [фокус]"; exit 2; }
ROOT="$(git rev-parse --show-toplevel 2>/dev/null)" || { echo "Не е git репо"; exit 2; }
mkdir -p "$OUT"
CODEX="$(command -v codex || command -v codex.cmd || true)"
[ -z "$CODEX" ] && { echo "CODEX_MISSING: codex не е в PATH (инсталиране: npm i -g @openai/codex; вход: codex login)"; exit 3; }
"$CODEX" login status >/dev/null 2>&1 || { echo "CODEX_NOT_LOGGED_IN: пусни 'codex login'"; exit 4; }

FILES="$(cd "$ROOT" && git diff --name-only --diff-filter=d "$BASE" -- ${FOCUS:-.} | grep -vE '(^|/)(en|en_re|gutdata|bladder|supabase\.min)\.js$|\.txt$|\.png$|PROJECT_MAP\.md$' )"
[ -z "$FILES" ] && { echo "Няма променени файлове спрямо $BASE"; exit 0; }
{
cat <<'EOF'
You are an independent senior reviewer of a static educational web app (PhysioNova: vanilla JS + three.js r128, Bulgarian UI, English in en.js).
Review ONLY the diff below and the changed files listed. Do NOT read site/index.html in full (1.6 MB) — use grep/sed on specific lines only if a changed file calls a shared helper.
Read CLAUDE.md (project rules and the model↔3D contract) first.

Look for real defects only: runtime errors, wrong logic or math in the physiological model (units, signs, stability of integration), memory leaks (three.js geometries/materials not disposed, listeners/intervals not removed, stop() not pushed to window.__cleanups), per-frame allocations, the 3D file computing physiology or writing model state (contract violation), global name collisions, broken zRegister/zSection/PHYS_SECTIONS integration, missing English for shown text, forbidden colours (any green or yellow, incl. #f08c00), iPad performance risks.
Do not report style preferences.

Output Markdown, one finding per block, most severe first, at most 15:
### [critical|important|minor] <short title>
- file:line
- claim: what is wrong (1–2 sentences)
- scenario: concrete input/state → wrong result or crash
- fix: concrete change
If you find nothing real, output exactly: NO FINDINGS
EOF
echo; echo "## Changed files"; echo "$FILES"; echo; echo '## Diff'; echo '```diff'
(cd "$ROOT" && git diff "$BASE" -- $FILES | head -c 120000)
echo '```'
} > "$OUT/codex-prompt.md"

( cd "$ROOT" && timeout 900 "$CODEX" exec -s read-only -C "$ROOT" --ephemeral --skip-git-repo-check --color never -o "$OUT/codex-out.md" - < "$OUT/codex-prompt.md" > "$OUT/codex-log.txt" 2>&1 )
RC=$?
[ $RC -ne 0 ] || [ ! -s "$OUT/codex-out.md" ] && { echo "CODEX_FAILED (код $RC) — виж $OUT/codex-log.txt"; tail -5 "$OUT/codex-log.txt"; exit 5; }
echo "OK → $OUT/codex-out.md"
