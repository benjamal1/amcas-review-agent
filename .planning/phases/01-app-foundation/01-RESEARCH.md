# RESEARCH — AMCAS local app (search-first, 2026-06-21)

## Reuse decision: assemble, don't fork

No single repo bundles browser-terminal + markdown-editor + dashboard at the right weight
(code-server / VS Code-web are far too heavy). Assemble battle-tested libs; build only glue.

### Reuse (do NOT hand-roll)
| Concern | Lib (confirmed current) | Note |
|---|---|---|
| Terminal in browser | `@xterm/xterm@6` | scoped pkg (old `xterm` renamed). |
| PTY backend | `node-pty@1.1` | native build; isolate in one module. Follow xterm.js's official node-pty attach demo. |
| Terminal transport | `ws` | xterm ↔ pty over websocket. |
| Markdown editor | `@codemirror/lang-markdown@6` + `codemirror@6` | don't build an editor. |
| Frontmatter parse | `gray-matter@4` | read/write YAML frontmatter. |
| File watch | `chokidar@5` | content-dir change → push refresh. |
| Server | `fastify@5` | static serve + REST + ws plugin. |
| Charts | Recharts (React-native) OR Chart.js | radar + bars; decide at build. |

### Build (thin glue only)
- 3-panel layout (Dashboard / Editor / Terminal).
- Sandboxed file REST routes (reject `..`, confine to CONTENT_DIR).
- Button → inject trigger phrase into pty session.
- Port the 13 DataviewJS panels → React components reading the same frontmatter.

### Key references
- xterm.js node-pty demo (official) — the terminal-over-ws pattern verbatim.
- gray-matter round-trip for the existing `scorecard.md` / `*-scores.md` frontmatter schema.

### Gotchas
- `node-pty` native rebuild on Node upgrades — pin Node version in `.nvmrc`, isolate module so
  terminal degrades gracefully if it fails to build.
- Fastify v5 + `@fastify/websocket` for the pty route; `@fastify/static` for the built UI.
- `@xterm/xterm` import path differs from legacy `xterm` docs — use scoped imports.
