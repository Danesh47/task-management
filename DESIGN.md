# Taskline design direction

## Product workspace

Operate mode. Taskline is a quiet, precise work surface: an ink navigation rail, warm white content, sage primary action and a carefully spaced table. Desktop leads; mobile becomes a labeled card list. The user delegated design selection, so implementation proceeds with this direction.

## Visual choice

Considered structures: familiar productivity table; studio project ledger; compact inbox; calendar-adjacent agenda; monochrome checklist; botanical stationery desk; split task inspector. Selected: botanical stationery desk expressed as a practical digital ledger. Its material grammar supplies ink typography, warm paper, restrained sage and generous line spacing, without ornamental illustrations. The Impeccable concept roll ran without external challengers because its remote service was unavailable; this is a grounded local design choice, not a catalog comparison.

## First viewport

Taskline mark and four real status filters in the left rail. A compact date in the top utility row. Main heading Tasks with task count and Add task. A slim contextual description, then a table with Task, Status, Due date and Actions. No hero banner, fake analytics or decorative metrics. Empty state is typographic, inviting the first task.

## Tokens

- Typeface: self-hosted variable DM Sans. Body 15px, supporting text 13px, heading 36px. Fixed rem scale.
- Ink #202722; muted #5D685F; canvas #F5F7F3; surface #FFFFFF; divider #E1E6DF.
- Rail #19231E; rail text #E6EDE7; rail secondary #B3C1B7.
- Sage primary #BCE3B7 with #203C29 text; hover #ACD6A6.
- Focus #326247; danger #B42318; control boundary #768374.
- Status Pending: #6B551D on #FAF0CF. In Progress: #285D87 on #E6F0F8. Completed: #326247 on #E5F1E3.
- Spacing 4/8/12/16/24/32/48px; controls radius 8px, task surface radius 14px.

## Interaction

Inline editor opens above the list, with a short opacity/reveal transition and title focus. This is the signature interaction: editing stays inside the working context. Status uses a native select; changes wait for server confirmation. Delete uses a native modal dialog. No optimistic persistence, automatic write retry or invented extra task fields.

## Responsive and states

Rail becomes a compact horizontal header on narrow screens; status navigation wraps. Task table becomes cards below 768px. Form becomes one column. Focus, hover, disabled, loading, empty, validation and request failures all receive distinct treatment. Success notices stay in the workspace and are announced. Reduced motion removes authored transitions.

## Implementation boundary

No screenshots or mock imagery are deliverables. The selected visual system is implemented directly in React/CSS. Browser inspection remains limited by the available runtime; do not claim a completed visual audit without actual inspection.
