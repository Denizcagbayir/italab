## Navigation and IA — ITAlab

Primary IA is a **5-tab bottom nav** (mobile-first learning app). Labels must stay consistent in Turkish across nav, headings, and CTAs.

### Sitemap

| Route | Nav label | Purpose |
|-------|-----------|---------|
| `/` | Ana | Continue lesson, daily stats, path preview |
| `/path` | Yol | Full A1–A2 unit map; drill into unit |
| `/path/:unitId` | (Yol) | Unit detail / lesson list |
| `/lesson/:unitId/:lessonId` | — | Lesson player (no tab highlight required) |
| `/practice` | Pratik | Hub: vocab, articles, verbs, SRS, mistakes |
| `/practice/vocab` etc. | (Pratik) | Sub-modes; back to hub clear |
| `/progress` | İlerleme | XP, streak, skills, export |
| `/settings` | Ayarlar | Voice, goals, data |

### Findability priorities (MVP)

1. **Continue** always obvious on Ana (primary CTA).
2. Pratik modes reachable in ≤2 taps from any tab.
3. Same concept = same label (`Pratik` ≠ `Alıştırma` mix).
4. Depth ≤3: Tab → Hub/Unit → Activity.

### Mobile

- Bottom nav always visible; respect `env(safe-area-inset-bottom)`.
- Prefer icons + short labels; labels must remain readable at 320px width.
