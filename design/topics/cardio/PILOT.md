# Пилот на конвейера: `cardio` — Сърдечен цикъл и PV примка

Цел: първата тема по новия конвейер (CLAUDE.md → „Конвейер за една тема“) + реално измерване на разхода.
Сравнение: оценка ≈2,7 млн. токена на тема с конвейера срещу ≈3,8 млн. при една дълга сесия.

## Изходно състояние (от PROJECT_MAP.md)
- `cardio` е единствената стара тема без 3D (2D PV примка). Изглед `viewCardio` index.html:610–662, тест index.html:5444–5456 (12 въпроса), експерименти `EXP_CARDIO` index.html:596–609 (6), теория `BOOK.cardio` index.html:7136–7161. Има 3D сърце в `heart3d` (`m/hglb*.txt`, `m/bp_heart.txt`, `m/bd_heart.txt`) — преизползвай моделите, не ги дублирай.
- Надграждане (`upgrade: true`): НЕ се ползва `zSection`; `zRegister("cardio",{…})` заменя изгледа/урока/теста. Старият код остава.

## Стъпки
0. **Codex:** `npm i -g @openai/codex` → `codex login --device-auth` → дай на потребителя линка и кода → изчакай `codex login status` = влязъл.
1. `physiology-spec` → `design/topics/cardio/spec.json` (Wiggers диаграма: налягания ЛК/аорта/ЛП, обем ЛК, клапи, фази; PV примка с ESPVR/EDPVR; пресети: норма, ↑преднатоварване, ↑следнатоварване, ↑контрактилитет, аортна стеноза, митрална регургитация и др. по преценка; `cases` с числа по Guyton гл. 9).
2. Паралелно: `3d-simulation-developer` → `site/js/sections/cardio-3d.js` (с MOCK) ‖ главната сесия → модел в `site/js/sections/cardio.js` до `node design/tools/spec-test.mjs cardio` = всички OK; после урок, тест (10–14), експерименти (4–6), речник; английски: Codex (`codex exec -s workspace-write` само за `en:{}` обекта, или главната сесия).
3. Сглобяване: `PHYS_SECTIONS` += `"cardio-3d","cardio"`; `t_section.js cardio --dev ipad,phone` и `--lang en`.
4. Паралелно (само четене): `physiology-expert`, `code-reviewer`, `ui-ux-designer`, `codex-reviewer`. ≤2 кръга поправки.
5. `npm run map`, commit, push, публикуване в https://claude.ai/artifact/EpkssS9vo7pMhXrxjdJwi2 (без `js/config.js`).

## Отчет за разхода (задължително) → `design/topics/cardio/cost.md`
- За всяко извикване на агент: име, модел, `subagent_tokens` от резултата, време.
- Codex: брой извиквания (токените му не се броят в Claude).
- Главната сесия: оценка (контекст в края на сесията + брой ходове); кажи ясно кое е измерено и кое — оценено.
- Сума и сравнение с 2,7 млн. / 3,8 млн.; какво струва най-много и как да се намали за следващата тема.
