# Blocks

A Claude skill for drawing interactive data visuals in chat. It works with the `show_widget` tool in the Claude desktop app.

Claude writes a short spec: a set of rows and a list of parts. A small runtime draws it. Every part reads the same rows, so when the reader filters, picks a row, opens one or drags a slider, every part updates together.

```js
Blocks({
  summary: 'Review findings. Filter by severity, open one for the reason, tick the ones to fix.',
  rows: [
    {name: 'Token logged in plain text', sev: 'High', tone: 'bad', mins: 20, why: 'auth/session.ts:88 logs the bearer token.'},
    {name: 'N+1 query on orders list', sev: 'Medium', tone: 'warn', mins: 30, why: '51 queries for 50 rows.'},
    {name: 'Duplicate date helper', sev: 'Low', mins: 10, why: 'formatDate exists twice.'},
  ],
  parts: [
    {type: 'facets', fields: ['sev'], labels: {sev: 'Severity'}},
    {type: 'stats', items: [{label: 'Showing'}, {label: 'Picked effort', scope: 'pick', of: 'mins', fmt: '# min'}]},
    {type: 'table', pick: true, body: 'why', cols: [{f: 'name', label: 'Finding', tone: true}, {f: 'mins', label: 'Effort', fmt: '# min', bar: true, sum: true}]},
    {type: 'act', items: [{label: 'Fix picked', prompt: s => s.picked.length && 'Fix: ' + s.picked.map(r => r.name).join('; ')}]},
  ],
});
```

## Parts

| Part | Lets the reader |
|---|---|
| `facets` | narrow rows with filter chips that show live counts, or a search box |
| `knobs` | change what-if values with sliders, choices or toggles |
| `stats` | see totals, averages or custom numbers, with a meter and the change from the start |
| `list` | read status rows or numbered plan steps, and open one for detail |
| `table` | sort, read exact values, see totals that follow the filters, open and tick rows |
| `bars` | compare sizes; clicking a group filters every other part |
| `line` | read a series point by point with the mouse or arrow keys |
| `cards` | compare two to four options, with the best one marked as values change |
| `act` | send their choices back to Claude as the next message |
| `view` | anything else, drawn by your own function on the shared state |

## Install

Copy this folder into your skills folder, for example `~/.claude/skills/blocks`. It needs Node 18 or later. There are no dependencies.

```bash
git clone https://github.com/TheSethRose/claude-blocks ~/.claude/skills/blocks
```

## How it works

1. Claude writes the spec to a file and runs `node bin/blocks.mjs spec.js`.
2. The builder runs every function in the spec against three states: as loaded, every row picked, and nothing shown. It also checks field names, part options and size limits, then reports errors and warnings.
3. It prints the widget: one script tag that loads the runtime from [jsDelivr](https://www.jsdelivr.com/), pinned to a release tag, plus the spec. That's 1 to 3 KB per widget. Use `--inline` to put the runtime inside the widget instead, so it needs no network.

[SKILL.md](SKILL.md) is what Claude reads. [references/spec.md](references/spec.md) documents every option. [examples/](examples) has six working specs.

## Develop

```bash
python3 -m http.server 8765
```

Open `http://localhost:8765/test/index.html`. Add `?dark` to test dark mode, or `?dist` to test the bundle. The page clicks through every example and reports each check. Release steps are in [references/maintain.md](references/maintain.md).

## License

MIT
