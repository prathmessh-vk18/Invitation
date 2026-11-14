# Telugu design (private, one client) — branch telugu-template

Based on Gauri Shankar, redesigned from the client's six-scene Shiva–Parvati reference.
Palette: beige parchment, antique gold, deep maroon. English first; Telugu only after the client approves.
Not a public design: preview at /lab/telugu, never listed.

Scene plan (ref order):
1. Opening — meditating pair in a gold halo (v1-opening.png)
2. Cover — faces close, trishul + damru behind, lower 40% empty for names (v1-cover.png)
3. Families/blessing — snowy Kailash, flower in her hair
4. Countdown — full moon over a lake, floating diyas
5. Functions — walking hand in hand
6. Closing — the dance

Art: Figma generate_image (file 13fxKGhRsxBS1mv02UWy9K), gpt-image-2.5-flare, 1024x1536.
Prompt core: "Devotional Indian painting, rich painterly brushwork with visible impasto strokes and gold leaf flecks,
strictly limited palette of warm beige parchment, antique gold and deep maroon (no blue sky, no pink)".

## Preview built (2026-11-13) — src/app/lab/telugu/TeluguInvite.tsx
Opening: meditation painting + "You're invited" + names → tap → halo rings draw in with turning rays,
"Srirastu / Shubhamastu / Avighnamastu" writes in → light blooms from the halo, talambralu (pearls,
turmeric rice, kumkum) falls → dissolves onto the cover (camera pulls back), thin gold frame fixed.
Sections: Cover (names write in) → Families (Kailash) → Countdown (moon is the dial, diyas flicker)
→ Functions (maroon cards fold open, gold shimmer) → Closing (dance, twinkles). Sample: Karthik & Sravani.
Kalyanam scene 5 (walking) not used yet.

## Concept v2 (2026-11-14) — client picked ref scenes 3 (Kailash, flower in hair) and 5 (walking hand in hand)
Palette now from those two: Himalayan dawn — snowy white peaks, pale lavender-blue sky, peach-gold sunrise,
blush-pink lotuses; text deep maroon + gold on an ivory/blush/lavender page. v1 (beige/gold/maroon) art kept
here as v1-*.png only. Art: v2-*.png → public/art/illus/telugu-v2-*.webp.
Opening v2: gold Ganesha (public/art/seals/srinita-ganesha.png, same as Srinita's) + "You're invited" + names
over the walking couple → tap: Ganesha glows, Srirastu/Shubhamastu/Avighnamastu writes in, sun swells with
turning rays, camera pushes in to the sun, light floods, talambralu + lotus petals fall → dissolve to cover.
Sections: Cover (flower in hair) → Families (meditation at dawn, small Ganesha) → Countdown (Mansarovar moon)
→ Functions (ivory cards, gold edge) → Closing (dance on the clouds).

## Current = v1 design with v2 backgrounds (2026-11-14) — /lab/telugu
User: keep the FIRST design exactly (meditation-halo opening, foreheads cover, Kailash families, moon
countdown, maroon cards, dance closing) — only the background colours change to the ticked scenes, plus the
gold Ganesha at the start. Art: telugu-v3-opening/v3-cover (repainted in the dawn palette, same compositions),
telugu-v2-cover (Kailash, families), v2-moon, v2-dance. The walking-couple concept is saved at /lab/telugu/v2.
(Exact background-only edits of the v1 paintings need Figma Weave linked: app.weavy.ai settings → link Figma.)

## Decision (2026-11-14): the client LOVED the walking-couple concept (v2), not the meditation one
Main preview /lab/telugu = walking-couple design (TeluguInvite.tsx, art telugu-v2-*).
Meditation version saved at /lab/telugu/meditation (TeluguInviteMeditation.tsx, art telugu-v3-* + v2).

## Client feedback round (2026-11-14) — couple: Shiva (groom) & Srilakshmi (bride), ONE function
- Colours: mostly beige, a little blue, a little maroon → paintings regraded (scratchpad grade script:
  violet sky → soft blue, softer pinks, beige wash stronger at the top) into public/art/illus/telugu-v4-*.webp.
- Shiva–Parvati paintings only at the start (opening + hero/cover after it) and the end (dance closing).
  Families = paper + Ganesha + lotus ornament; countdown = a drawn pearl moon with blue glow.
- One function → one show-piece Kalyanam card: maroon arch, gold zari edge drawn in, mango-leaf/marigold
  thoranam, talambralu drifting inside, Directions + Add to calendar.
- Fonts as the Marathi design: Great Vibes (added to src/lib/fonts.ts), Cinzel, Cormorant.
- Still sample: parents' names, venue (Sri Sai Convention, Gachibowli), date 14 Feb 2027, muhurtham 7:42 am.

## Client round 2 (2026-11-14)
- Hero after the intro = Gauri Shankar's palm-and-step (shiv-hand.webp + shiv-parvati-step.webp, same layout
  units as gaurishankar.tsx Meeting) on a blue-to-beige sky, then names.
- Seated-on-Kailash painting (telugu-v4-cover) moved to the closing, replacing the dance.
- Added Photo album (arch gold frames, swipe + lightbox; sample /art/moments photos) and With Best Compliments
  (sample names + little ones). Order: intro → hero → families → countdown → wedding card → album →
  compliments → closing.
- Shared with the client at https://aavjoo.in/lab/telugu (lab pages merged to main; noindex, unlinked).
- Music: "Pournami - Flute Music" (public/music/pournami-flute.mp3, from the client's file) starts on the opening tap from 0:05 and loops back to 0:05; maroon music toggle bottom-right.
- Real details (2026-11-14) from the family's printed card proof: Srilakshmi (bride, first, as on their card) with
  Shiva Chander Reddy; hosts Smt. Jayalakshmi & Sri Saranala Babu Rao (grandparents); bride's parents Smt. Sridevi
  & Sri Saranala Srinath; groom's Smt. Kavitha & Sri Cheryala Raji Reddy; Sumuhurtham Sat 5 Dec 2026, 11:43 am,
  followed by lunch; Sriman Convention, Aziz Nagar, Hyderabad; compliments Sri S. Sridhar Rao, Sri S. Srikrishna
  and near & dear. Their spellings: Srirasthu / Subhamasthu / Avighnamasthu.
- Function card simplified to one title ("Wedding", not Kalyanam too): date, Sumuhurtham time, venue, lunch,
  Directions (Google Maps search for the venue; swap in their QR's link if they send it). Photos still demo.
- Grand round (2026-11-14): countdown = rectangular Kanjeevaram silk panel (TempleBorder zari band with gopuram
  triangles, buttas, self-drawing dot kolam, two brass kuthu vilakku with flickering flames, flip-clock tiles,
  zari shimmer). Wedding card = temple entrance: gold gopuram whose tiers light bottom-up, carved brass doors that
  swing open (useInView amount .6), petals, swinging temple bells, banana plants either side, threshold kolam.
  Garland/arch removed. All code-drawn SVG/CSS.
- Subtle round (2026-11-14): client found it too grand → removed gopuram, banana plants, kolam, bells, lamps. Countdown = light ivory panel with a slim gold temple-border trim and maroon numbers that turn over; wedding card = maroon silk with slim trim, brass doors still open on view.
- Scratch to reveal (2026-11-14): 'A little surprise · Save the date' ivory card under gold foil (same mechanics as src/invites/scratch.tsx), between families and countdown; reveal bursts petals, pearls and rice.
- Photos (2026-11-14): the couple's 4 photos graded warm/creamy (scratchpad photo-grade.mjs: greens x0.55, sat x0.9, 9% beige wash, lifted blacks), cropped to 2:3, photographer credit kept, uploaded to R2 photos/moments/<uuid>.jpg (unoptimized <Image>). Album frames now 2:3; fixed the strip overflowing the screen.
- Telugu round 1 (2026-11-14): intro = Ganesha + Vakratunda mantra (Telugu), pill 'Tap here', names removed from intro; blessing on tap = శ్రీరస్తు/శుభమస్తు/అవిఘ్నమస్తు word by word (Telugu can't be split per letter); hero line 'Join us as we celebrate the union of a lifetime' above the names; families top row in Telugu; closing = ఓం ఉమామహేశ్వరాభ్యాం నమః + #Srilu'sChand instead of names. Font: Noto Serif Telugu (--font-telugu in src/lib/fonts.ts).
