## Color tokens — ITAlab

Source of truth in CSS: `src/index.css` (`:root` variables). Prefer semantic roles; map new UI to these.

| Role | CSS var | Value | Use |
|------|---------|-------|-----|
| Surface / page bg | `--bg0`, `--bg1` | `#e7efe9`, `#f4f7f5` | Page wash |
| Card surface | `--card` | `rgba(255,255,255,0.72)` | Panels, practice cards |
| Text primary | `--ink` | `#14261c` | Headings, body |
| Text muted | `--muted` | `#5a6b60` | Meta, secondary |
| Brand / primary action | `--brand` | `#1a5c45` | CTAs, active nav, ITA mark |
| Brand deep | `--brand-deep` | `#0f3d2e` | Pressed / emphasis |
| Accent | `--accent` | `#2a6f97` | Secondary highlights |
| Success | `--ok` | `#1f8a5b` | Correct answers |
| Error | `--bad` | `#c23b3b` | Wrong answers, destructive |
| Warning | `--warn` | `#b7791f` | Soft warnings |
| Border | `--line` | `rgba(20,38,28,0.12)` | Dividers, card edges |

**Rules:** Do not introduce purple/indigo defaults or dark-mode-first palettes. Keep light, botanical Italian-study feel.
