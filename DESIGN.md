# Nimantran design system

The marketing site is quiet and monochrome. The invitations are the colour. Every page should
feel like a calm, well-lit gallery with the designs hung on the walls.

- Tokens: `src/app/globals.css` (`@theme` block)
- Components: `src/ui` — import from `@/ui`
- Live style guide: `/design-system`

## Principles

1. **Chrome stays neutral.** Use `ink`, the greys and `surface` for everything the site itself
   draws. Colour appears only inside invitation previews, template tints and inline icons.
2. **Big, tight, centred headlines.** Hero and section headings are centred, set in `text-display`
   or `text-heading`, with negative tracking already built into the tokens.
3. **Grey panels, not shadows.** Group things with `bg-panel` and a large radius. Use
   `shadow-lift` / `shadow-phone` only on floating phones and hovered tiles.
4. **One primary action per view.** A black `Button` for the main action; a grey `secondary`
   beside it if needed.
5. **Charm in small doses.** Inline icons in headlines, a live dot on a badge, chat bubbles. At most
   one charming device per section.

## Colour

| Token | Use |
| --- | --- |
| `ink` | Headings, body copy, primary buttons, active pills |
| `muted` | Lead paragraphs and descriptions |
| `subtle` | Captions, meta, inactive tabs |
| `faint` | The second, grey line of a two-tone heading |
| `line` | Dividers and the tab track |
| `panel` / `panel-strong` | Frames, cards, secondary buttons / their hover |
| `surface` | Page background and white cards inside panels |
| `tint-*` | Background behind one template's preview — pick the tint that matches the design |
| `whatsapp`, `whatsapp-bubble`, `whatsapp-wash` | WhatsApp buttons and chat moments only |
| `live` | The pulsing live dot only |
| `placeholder` | Copy that must be replaced before launch |

Never put grey text on a grey panel below `muted`; `subtle` is for white backgrounds.

## Type

Geist for the whole site. Devanagari lines use `font-deva`.

| Class | Size | Use |
| --- | --- | --- |
| `text-display` | 40–80px, 600 | The hero headline only |
| `text-heading` | 34–56px, 600 | Section headings. Use `<Heading muted="…">` for the two-tone pattern |
| `text-title` | 18px, 600 | Card titles, FAQ questions |
| `text-lead` | 19px | Hero and section intros, max 520px wide |
| `text-body` | 15px | Card copy |
| `text-caption` | 13px | Captions, tabs, meta |

Write headings in sentence case. Keep them short enough to break onto two lines on desktop.

## Layout

- Page width `max-w-page` (1100px); the gallery frame uses `max-w-wide` (1180px). Use `<Container>`.
- Sections use `<Section>`: 112px vertical rhythm; `tone="panel"` for a grey band.
- Alternate white and panel bands; never two panel bands in a row.
- Grids: 3 columns on desktop, 2 on tablet, 1 on phones.

## Radius

`rounded-frame` 36px (product frame) · `rounded-card` 28px (panels, feature cards) ·
`rounded-tile` 20px (preview tiles, FAQ items) · `rounded-full` (buttons, pills, badges).

## Components (`@/ui`)

| Component | When |
| --- | --- |
| `Button`, `ButtonLink`, `buttonClass()` | Actions. Variants: `primary`, `secondary`, `inverse` (on dark), `ghost` |
| `Container`, `Section` | Page layout |
| `Display`, `Heading`, `Title`, `Lead`, `Eyebrow` | Type |
| `Panel`, `Frame` | Grey card; grey frame with a white window for product shots |
| `InlineIcon` | Rounded icon tile inside a headline — max three, each rotated a few degrees |
| `AppIcon`, `TileCaption` | Icon + name + subtitle under a template tile |
| `Badge` | Small pill label; `live` adds the pulsing dot |
| `ChatBubble` | WhatsApp moments (`from="me"` for green) |
| `FilterPills`, `Tabs` | Gallery filtering and sorting |
| `Accordion` | FAQ |
| `Reveal` | Fade-up on scroll; use on section content, not on every element |
| `Placeholder` | Marks copy that must be replaced before launch |
| `PhoneFrame` | Device frame around an `InvitePreview` |

## Motion

- Entrances: `Reveal` (fade up 24px, 0.8s, ease `[0.22, 1, 0.36, 1]`), staggered by 0.08s.
- Hover: tiles lift their phone slightly; buttons darken. No bouncing or scaling text.
- Respect reduced motion (handled globally in `globals.css`).

## Writing

Plain, warm, specific. Talk to the couple ("your family", "your guests"). Use the real names of
ceremonies (Haldi, Mehndi, Sangeet, Pheras). No exclamation marks in headings. Stats and reviews
are only shown when real; until then use `Placeholder`.

## Invitations

Templates live in `src/invites`. They are free to be bold, colourful and decorative; none of the
site rules above apply inside an invitation.
