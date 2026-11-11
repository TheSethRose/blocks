# Spec

```js
Blocks({
  summary: 'One sentence for screen readers: what this shows and what the reader can do.',
  rows:   [{name:'Composio', pay:40, hours:2, tone:'good'}, ...],  // one object per thing
  name:   'name',            // field that names a row. Default 'name'
  params: {rate:5},          // what-if values that knobs change
  derive: (r,p,rows)=>({total:r.pay*p.rate}),   // extra fields per row, redone on every change
  pick:   [0,2],             // row ids picked at the start
  focus:  1,                 // row id opened at the start
  parts:  [{type:'stats',...}, {type:'table',...}],   // drawn top to bottom
});
```

Helper functions go after the `Blocks(...)` call in the same file as `function` declarations.

## Rows

- A row's id is its `id` field, or its position (0, 1, 2) when it has none.
- `tone` on a row is `'good'`, `'warn'` or `'bad'`. `icon` is a Tabler name without the `ti-` prefix and replaces the tone's icon.
- Keep numbers as numbers (`40`, not `'$40'`). Sorting, bars and sums need them.
- `derive` may return `tone` too, for example `tone: r.spend>500 ? 'warn' : undefined`.
- All text is escaped. HTML in a row shows as plain text.

## fmt

A string with `#` where the number goes: `'$#'` → `$1,235`, `'#.0%'` → `2.5%`, `'# min'` → `45 min`, `'$#.00'` → `$13.55`. Negatives come out as `-$40`. Or a function: `v=>v?'Year '+v:'Never'`. With no `fmt`, numbers show up to 2 decimals.

## State

Functions in a spec receive `s`:

| Field | Holds |
|---|---|
| `s.rows` | rows that pass the filters and search |
| `s.all` | every row, with derived fields |
| `s.picked` | picked rows |
| `s.p` | current params. `s.p0` is the start |
| `s.focus` | id of the open row, or `null` |
| `s.changed`, `s.filtered` | true when params differ from the start, or when a filter hides rows |
| `s.f`, `s.q` | active filters as `{field:Set}` and the search text |
| `s.set(s=>{...})` | change state from a `view` part, then redraw everything |

Every function must cope with empty `s.rows` and empty `s.picked`. The builder runs each one in three states (as loaded, all picked, nothing shown) and reports what throws.

## Parts

### facets — narrow the rows

```js
{type:'facets', fields:['sev','area'], labels:{sev:'Severity'}, names:{p1:'Urgent'}, search:true}
```

One row of chips per field, each with a live count. Chips in one field add up (High or Low); fields narrow each other (High and auth). `search:true` or `search:'Find a file'` adds a text box for long lists. A `tone` field shows tone icons on its chips.

### knobs — change a param

```js
{type:'knobs', items:[
  {p:'deposit', label:'Monthly deposit', min:0, max:1500, step:50, fmt:'$#'},   // slider
  {p:'plan', label:'Plan', options:['Monthly','Yearly']},                       // segmented choice
  {p:'cost', label:'Cost matters', options:[0,1,2,3], names:{0:'Not',3:'Most'}},
  {p:'tax', label:'Include tax', toggle:true},                                  // checkbox
]}
```

Each `p` must be a key in `params`. Something must read the param: `derive`, a `series` function or an `agg` function.

### stats — the numbers that sum it up

```js
{type:'stats', scope:'rows', items:[
  {label:'Spend', of:'cost', fmt:'$#'},                       // sum of a field
  {label:'Findings'},                                          // count of rows
  {label:'Slowest', of:'ms', agg:'max', fmt:'# ms'},           // sum avg min max count
  {label:'Picked effort', scope:'pick', of:'mins', fmt:'# min',
   max:120, tone:v=>v>120?'bad':v>90?'warn':'', note:v=>v>120?'over the slot':'of a 2 hour slot'},
  {label:'Final balance', agg:(rows,s)=>grow(s.p).at(-1), fmt:'$#', good:'up'},
]}
```

- `scope`: `'rows'` (shown rows, the default), `'pick'` or `'all'`. Set it on the part or on one item.
- `max` (number or `s=>number`) draws a meter under the number. `tone` colors the meter and adds an icon.
- `note` is the line under the number: a string, or `(v,s)=>string`. When there's no function note, the runtime writes it: the change from the start after a slider moves, or "of `<total>`" while filtered.
- `good:'up'` or `good:'down'` colors that change arrow. Leave it out when neither direction is good.
- One item alone becomes a 40px headline number.

### list — status rows or plan steps

```js
{type:'list', detail:'when', body:'how', rail:true, pick:true, label:'title', fmt:'$#'}
```

Each row shows its tone icon, its name (or `label` field), and `detail` on the right. `body` is the text that opens under a row on click; `\n` makes a new line. `rail:true` draws numbered steps joined by a line, for plans and sequences. `label`, `detail` and `body` take a field name or `r=>value`.

### table — exact values

```js
{type:'table', sort:'-mins', limit:8, pick:true, body:'why', cols:[
  {f:'name', label:'Finding', tone:true},              // tone icon before the text
  {f:'area', label:'Area', w:'90px'},
  {f:'mins', label:'Effort', fmt:'# min', bar:true, sum:true},
]}
```

Every header sorts. `sort` sets the start order; `-` means largest first. `bar:true` draws a data bar under each number, on one scale for the column. `sum:true` (or `'avg'`, `'min'`, `'max'`) adds a totals row that follows the filters. `limit` shows that many rows and a "Show all" link. `body` opens under the clicked row. `pick:true` adds a tick box per row.

### bars — compare sizes, click to narrow

```js
{type:'bars', by:'service', of:'cost', fmt:'$#', sort:true, label:'Service'}   // one bar per group
{type:'bars', of:'score', fmt:'#.0', sort:true}                                // one bar per row
```

- With `by`: rows are grouped and summed (`agg` changes that: `'avg'`, `'count'`, a function). Clicking a bar filters every part to that group; a second bar adds to it. Other bars in the same part dim but keep their size. When another filter is on, a hollow outline shows each bar's full size. `filter:false` turns clicking off.
- Without `by`: one bar per row. Clicking opens that row. After a slider moves, the outline shows where each bar started.
- Bars show sizes, so use them for values that are zero or more.

### line — a shape over a sequence

```js
{type:'line', x:'week', y:[{f:'spend',label:'Spend'},{f:'budget',label:'Budget'}], fmt:'$#', mark:{y:500,label:'Budget'}}
{type:'line', fmt:'$#', mark:{y:100000,label:'Goal'},
 series:s=>({x:years(s.p), y:[{name:'Balance',data:grow(s.p)},{name:'Deposits',data:paid(s.p)}]})}
```

- From rows: `x` is the label field and `y` the number fields. Hovering a point marks that row in other parts; clicking opens it.
- From a function: `series(s)` returns `{x:[labels], y:[{name, data:[numbers]}]}`. Every `data` must be as long as `x`. After a slider moves, a dotted ghost shows the starting lines.
- The line above the chart reads out the hovered point, or the last point when idle. Arrow keys step through points.
- `mark` draws a dashed level such as a goal or a limit. `zero:false` lets the axis start above zero. `h` sets the height (default 200). Up to 6 lines; each gets its own color and dash.
- `null` in data leaves a gap.

### cards — two to four options

```js
{type:'cards', best:'score', bestLabel:'Top score', pick:true, title:'name', lines:[
  {f:'price', label:'Monthly', fmt:'$#'}, {f:'setup', label:'Setup', fmt:'#.0 hr'}]}
```

`best` marks the card with the highest value of that field; `'-price'` marks the lowest. The mark moves as sliders and filters change the numbers. Clicking a card picks it with `pick:true`, or opens it otherwise.

### act — hand the choice back

```js
{type:'act', items:[{
  label:  s=>s.picked.length ? `Fix ${s.picked.length} picked` : 'Fix picked',
  prompt: s=>s.picked.length && 'Fix these findings: '+s.picked.map(r=>r.name).join('; '),
  need:   'Tick at least one finding first.',
}]}
```

A button that sends `prompt` to the chat as the reader's next message. Build it from `s` so it carries the real names and values. When `prompt` returns nothing, the button shows `need` and sends nothing. The message also appears beside the button, because sending can fail silently in the Code tab. The runtime adds the ↗ to the label.

### view — anything else

```js
{type:'view', draw:(el,s)=>{ el.innerHTML = `<small>${B.esc(s.rows.length)} shown</small>` }}
```

`draw` runs on every change. Escape row text with `B.esc`. Format with `B.fmt(v,'$#')`. Change state with `s.set(s=>{ s.p.rate = 7 })`. Give a clickable element `data-do="focus" data-a="<row id>"` (or `pick`) to reuse the built-in actions, and `data-id="<row id>"` to join the shared hover.
