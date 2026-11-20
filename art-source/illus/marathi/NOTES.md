# Marathi design: source art

Storybook style (clean outlines, flat warm colour), generated in Figma (file 13fxKGhRsxBS1mv02UWy9K).
Preview: /lab/marathi on branch `marathi-template` (src/app/lab/marathi/MarathiInvite.tsx).

| Source | Becomes (public/art/illus) |
|---|---|
| v2-cover.png | `marathi-couple.jpg` (couple only, frame painted out) and the fixed frame `marathi-frame-arch.webp` / `-pillars-2.webp` / `-lamps-2.webp` (arch 0–33%, pillars 33–63% stretched to any height, lamps 63–100%; paper fills outside the arch so the invite scrolls behind it) |
| v2-antarpat.png | `marathi-antarpat-plain.webp` (cloth, used as a border-image: slice 6% 17.5% 12% 17.5%) and `marathi-antarpat-silk.webp` (the silk between the borders, stretched as the fill) |
| v2-closing.png | `marathi-wada.jpg` (closing: the walk home to the wada) |
| v2-card.png | not used now (a Paithani card frame from before the fixed frame) |

Cutting notes: frame alpha = difference from the paper colour (251,240,214) inside the frame zone;
the arch opening is a flood fill from the middle of the scene (PIL: copy the image made from a
numpy array first, or the fill silently does nothing). Rename a file when replacing it, or the
Next image cache keeps serving the old one.

## Where it stands (20 Nov 2026), resume here

Section order (same as the other designs): Cover → Families → Scratch → Countdown → Functions → Closing.
New sections are in `src/app/lab/marathi/Celebrations.tsx`. Solid colours only (the user found gradients
didn't work): flat gold `#b88a2e`, cream, maroon script.

- **Functions:** each in an arched niche with a double gold rule; date, script name, lotus rule, time,
  venue, dress, "Get directions". Approved look.
- **Countdown:** lettering only (gold numbers, gold hairlines between, small labels). Approved after
  rejecting diyas and a garland ("make it minimum").
- **Scratch:** a heart of gold leaf with a jaali pressed in, "Rub the gold"; rubbing shows the date in
  the heart, then the muhurta time, petals, "Shubh Mangal Saavdhan". Heart shape approved. Rejected:
  a mandap inside the mandap ("such a bad design, be creative"), and earlier a haldi smear, a ghatika
  bowl and flat Kalnirnay/icon cards (didn't match the theme).
- `/lab/marathi/ideas`: still mockups of three other scratch covers (antarpat, kunku, Paithani), not
  chosen; delete once the scratch is final.

### Open question for Sunday
The user said "leave heart shape". Ask: keep the heart and add something around it, or a new shape?
If keeping it, three ideas to mock up first (as images, before building):
1. **Mundavalya:** two short pearl strings hang from the heart's top; when the gold is rubbed off
   they part to each side, like the strings on the couple's foreheads.
2. **Rangoli ring:** a thin ring of white dots and petals around the heart, like a rangoli at the
   door; it finishes drawing itself once the date shows.
3. **Kalash on top:** a small gold kalash with mango leaves on the heart's top notch; akshata fall
   from it at the reveal.
Competitor reference the user liked: textured gold foil cover, and the date revealed inside an
ornate gold frame (we have no such frame; don't reuse the mandap).

Then: sanai music, RSVP and photo sections, make it orderable (registry, templates.ts, form parity,
PDF skin, name and price). Don't merge into main until the user says so.
