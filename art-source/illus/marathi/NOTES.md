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
