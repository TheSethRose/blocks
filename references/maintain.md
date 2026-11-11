# Maintain

## Layout

| Path | Holds |
|---|---|
| `runtime/core.js` | the store (rows, filters, picks, params), the redraw loop, shared actions, `act` and `view` |
| `runtime/<part>.js` | one part each: `B.parts.<name>=(el,o,s,i)=>draw`, plus its CSS added to `B.css` |
| `bin/blocks.mjs` | checks a spec in Node and prints the widget; `--inline` embeds the modules it uses, `--bundle` rebuilds `dist/` |
| `dist/blocks.js` | every runtime module in one file, served by jsDelivr from a version tag |
| `examples/*.js` | one spec per interaction; the tests load them and the skill copies from them |
| `test/index.html`, `test/tests.js` | browser tests that click through every example |

The files in `runtime/` are the source. `dist/blocks.js` is the same code joined into one file. Keep the code tight: it is downloaded for every widget, and typed out in full by `--inline`.

## Release

Widgets load `cdn.jsdelivr.net/gh/TheSethRose/claude-blocks@v<VERSION>/dist/blocks.js`. A tag never changes once jsDelivr has served it, so a release can never break a widget already in a chat.

1. Make the change in `runtime/` and pass the tests below.
2. Raise `VERSION` in `bin/blocks.mjs`: the patch number for fixes, the minor number for new options or parts, the major number when an old spec would draw differently.
3. Run `node bin/blocks.mjs --bundle`.
4. Commit, tag `v<VERSION>`, and push the commit and the tag.
5. Open the CDN URL and confirm it serves the new file before using it.

Until the tag is pushed, the builder warns that `runtime/` differs from `dist/`. Use `--inline` in the meantime. Never move or delete a pushed tag.

## How a part works

`B.parts.name(el,o,s,i)` runs once to set up and returns `draw(s)`, which runs on every state change. `el` is the part's own `<div class="bk-name">`, `o` its spec, `i` its position.

- Simple parts set `el.innerHTML` in `draw`. Parts with live inputs (`knobs`, `facets` search, `line`) build once and update in place, so a drag or typing isn't interrupted.
- No part listens for clicks itself. Mark elements with `B.btn(action, arg, focusKey)`; the root handler calls `B.acts[action](s, arg, el)`. Enter and Space work on these too.
- `data-fk` must be unique in the block. The root uses it to put keyboard focus back after a redraw.
- `data-id="<row id>"` joins the shared hover (`.hv`). The open row gets `.on`.
- Never change another part's DOM. Change state with `s.set(...)` and let every part redraw.
- Use `<span role="button">`, not `<button>`, for controls. The host restyles real buttons. `act` uses real buttons on purpose.
- Colors come from host tokens and `--c1` to `--c6`. Nothing is hard-coded per mode.

## Test

```bash
python3 -m http.server 8765 --directory ~/.claude/skills/blocks
```

Open `http://localhost:8765/test/index.html`, then again with `?dark` and with `?dist` (which tests the bundle). The top line must read `ALL PASS`. The page stubs the host's color tokens and `sendPrompt`, so it checks behavior and layout, not the exact host look. After a change, also show one example with `show_widget` and ask the reader to confirm it renders, because the host frame can't be inspected from here.

## Add a part

1. Write `runtime/<name>.js`, following `cards.js` for size and shape.
2. Add its field checks to `bin/blocks.mjs`, and a `warn` for the way it's most likely to be misused.
3. Add or extend an example that uses it, and load the module in `test/index.html`.
4. Add tests that click it and check that the other parts changed.
5. Document it in `spec.md`, and add a row to the question table in `SKILL.md` if it answers a new question.

Add a part only when it lets the reader ask something no current part can. A new look for the same question belongs in an option, or nowhere.
