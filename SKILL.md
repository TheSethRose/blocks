---
name: blocks
description: Interactive data visuals for `show_widget` in the Claude desktop app. One set of rows feeds linked parts (filter chips, stats, tables, bars, line charts, cards, what-if sliders, step lists, send-back buttons), so a filter, a pick or a slider changes every part at once. Use before drawing a visual in chat, or when an answer holds status, numbers, findings, a comparison, a plan, a what-if or a decision the reader can explore or hand back. Not for pages meant for other people (use Artifact) or sites and apps in a repo.
---

# Blocks

A block is a small data app inside your answer. You give it rows and a list of parts. Every part reads the same rows, so when the reader filters, picks, opens or drags something, all parts change together. The point is to let the reader ask the data their own questions, which text can't do.

You write a short spec. A tested runtime draws it. You never hand-write the widget's HTML, CSS or event code.

## Build one

1. Write the spec to a file in your scratchpad, for example `findings.js`. It holds one call: `Blocks({ summary, rows, parts })`.
2. Run the builder from this skill's folder. It checks the spec, then prints the widget code.

```bash
node <this skill's folder>/bin/blocks.mjs findings.js
```

3. Fix every `error` line and run it again. Read each `warn` line and act on it or accept it.
4. Pass the printed code, unchanged, as `widget_code` to `show_widget`. Call `read_me` once per session first if you haven't; where it differs from Blocks on look or layout, Blocks wins.

The printed code is your spec plus one script tag that loads the runtime from jsDelivr, pinned to a version. If the block shows "The Blocks runtime did not load", build again with `--inline`, which puts the runtime inside the widget instead.

Read [spec.md](references/spec.md) for every part and option. Copy from the closest file in `examples/`: `triage.js` (filter, open, pick, send back), `whatif.js` (sliders and a projection), `compare.js` (weights re-rank options), `breakdown.js` (click a bar to narrow everything), `plan.js` (steps with status), `trend.js` (a chart and table that share rows).

## Start from the reader's question

Pick the interaction first, then the parts. An interaction earns its place only when it changes what the reader knows or what they send back to you.

| The reader wants to ask | Give them | Parts |
|---|---|---|
| Which of these matter to me? | Narrow | `facets`, or `bars` with `by` |
| What's behind this one? | Open | `body` on a `table` or `list` |
| Where does the total come from? | Break down | two `bars` with `by`, `stats`, `table` |
| What if this number changes? | What-if | `params`, `knobs`, then `derive` or a `series` function |
| Which option wins for what I care about? | Weigh | `knobs` as weights, `derive` a score, `bars` and `cards` with `best` |
| What happened over time? | Read along | `line`, with a `table` when single values matter |
| Where are we in the plan? | Walk | `list` with `rail` and `body` |
| Do these, not those | Hand back | `pick` on a `table`, `list` or `cards`, plus `act` |

The runtime does the linking for you:

- A filter recounts every stat, bar, table and chart. Stats show "of" the full total while filtered.
- A changed slider shows the change from the start on stats, a "was" value on the control, and a ghost of the first line or bar on charts. Reset brings it back.
- Hovering a row or chart point marks the same row in every part. Clicking opens it.
- An `act` button builds its message from the current picks, filters and sliders.

## Rules

- The text must stand alone. Put the answer and any decision in your message, because a visual may not show everywhere. Never repeat the whole visual in words.
- Skip the block when one or two sentences say it, or when nothing in it would respond to the reader. A markdown list or table is the right tool for a short static answer.
- Use only numbers you were given or worked out. Add no currency or unit you weren't given. Put raw numbers in rows and let `fmt` add the unit.
- Give the reader a sensible starting state: pre-pick your recommendation with `pick`, open the row that matters with `focus`, and set `params` to the real current values.
- Say each fact once. Two parts may show the same rows only when each answers a different question, such as a chart for the shape and a table for exact values.
- A tone is `good`, `warn` or `bad`, and only for a real state. Most rows need none. The runtime pairs every tone with an icon and words.
- Use `act` only when the next step needs you to think. Filtering, sorting, sums and what-ifs run in the page.
- Every control must change something the reader can see. The builder warns about picks nothing reads and sliders nothing uses.
- Parts hold data, not explanation: no titles or prose inside the block beyond labels. Keep labels to a few words, in sentence case.
- Keep it small: 4 stats or fewer, 8 chip values or fewer per field, 12 bars or fewer, and a `limit` on tables past 12 rows. A chart needs enough points to show a shape; two numbers are a sentence.
- For something the runtime can't draw, add a `view` part (see spec.md) rather than hand-writing a whole widget. If the reader reports "`<part> failed: ...`" in the block, that text is the error to fix.

To change the runtime, add a part or run the tests, read [maintain.md](references/maintain.md).
