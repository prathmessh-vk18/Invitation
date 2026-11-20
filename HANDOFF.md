# Handoff (2026-11-15)

Where things stand, for whoever picks this up next.

## Workflow for a couple's change (any invite)

1. Back up the order and invite JSON first.
2. Change `orders.details` **and** `invites.data` (same keys).
3. Log it in `order_edits` with `source: "by hand"`.
4. Run `npx tsx --env-file=.env.local scripts/check-approvals.mts`. These listings are known and harmless: AAV-1012, 1027, 1567, 1189, 1813.
5. Refresh the live site with an empty commit to `main`. Pages are cached, and a deploy clears the cache.
6. Check the live page.
7. Run `npx tsx --env-file=.env.local scripts/backup-invites.mts`.

Settings set by hand are kept through a couple's own edits by `keepInviteSettings` (src/lib/orders.ts). Each new setting needs:

- a type in `src/data/invites.ts`
- a passthrough in `validateDetails` (src/lib/orders.ts)

## Order forms: "Make it yours" for new orders (from 2026-11-19)

- **New orders, every design:** `/start/<design>` uses `MakeItYours.tsx` (src/app/(site)/start/[template]/). It has seven screens, one per part of the invite (cover, families, functions, ending, look, photos & song, your details), a bottom bar (← · Preview · Next) and the WhatsApp share preview.
- **Changing an existing order, and admin:** still use the older `OrderForm.tsx` (`/order/<id>/edit`, `src/app/admin/AdminForm.tsx`). Orders placed before this date are untouched.
- Both forms share `form-model.ts` (toDetails / fromDetails / validate). A new field added to one should round-trip through the other. Check with `scripts/check-approvals.mts`.
- Cover defaults per design (line above the names, word between them) are set in `coverDefaults` in form-model.ts. If a design's own default changes, update it there too.
- Prefilled designs (`prefill: true`, e.g. Shiva Kalyanam) start with the demo's details and photos.
- **Every word the design prints** (Mandir, Gauri Shankar, Chameli, Khat): each screen has a "✎ Change …" panel (`MoreWording.tsx`) drawn from the editor's field map in `src/config/editor.ts`: headings and small lines of save-the-date, countdown ("Until we say I do"), functions, photos, contacts and RSVP, Chameli's cover words, and small layout options. Values ride in `FormState.more` by their path ("words.countdownTitle", "rsvpTitle"…) and `toDetails`/`toPreview` set them in. A new field in editor.ts shows up here automatically. Changing an existing order (OrderForm) keeps them through `keepInviteSettings`, but can't edit them yet.

## Per-invite settings added recently

Use these before writing new code.

**Any design**

- `words`: rewords fixed phrases, keyed by i18n key, e.g. `{ momentsKicker: "Their moments", scratchTitle: "Date and Place" }`. `""` hides a kicker.
- `boldText`: heavier text and darker ink (set by hand: AAV-1889, AAV-1783).
- `readable`: faded text made solid, same weight. New Chameli orders get it by default (theme `readable: true`); every Chameli order placed before 16 Nov 2026 carries `readable: false` (and `boldText: false`) so it looks as approved.
- `blessingTop`: Mandir/Vachan's blessing line ("With the blessings of Lord Ganesha") above the hosts, as the PDF has it. New orders get it by default; every Mandir/Vachan order and invite made before 17 Nov 2026 carries `blessingTop: false` (under the names, as approved), except dev-weds-kamakshi (true).
- `rsvpPlain`: no ornament under the RSVP title (Mandir). Aastha & Krishna (AAV-1888).
- `countdownTitle`
- `noMapSearch`: shows Directions only where the couple gave a map link.
- `occasion: "reception"`
- `hideEvents`: a save-the-date, with no functions section (the order still keeps one function for the checks; hide `rsvp` too). First for Sayoni & Jay.
- `lang: "hi"`: the whole invite in Hindi. Mandir, Chameli, Gauri Shankar and the PDF all follow it; give Hindi invites a `slugBase` (e.g. "nikhil-weds-nandini") since Devanagari names can't make a link; translate the couple's own text by hand (names, parents, functions, venues, city, message, closing). Live for anuj-weds-riya (shekhar-weds-meenakshi was tried and reverted to English at the client's request).
  Hindi names and titles use Tiro Devanagari; the Hindi invites made before 19 Nov 2026 carry `scriptFont: "rozha"` to keep the heavier Rozha One they approved.
- `video` (`{ src, poster }`): a couple's own finished video plays full screen in place of the design; `template` then only colours the share card. Compress to 1080×1920 H.264 (~15 MB) and upload to R2 `videos/<slug>.mp4` + `.jpg` poster. (Tried for ananya-weds-debi, since deleted: buffered because media.aavjoo.in isn't cached by Cloudflare yet.)

**Fonts:** Gauri Shankar's script is Great Vibes (as Shiva Kalyanam) for orders from 16 Nov 2026 (22:53); the 92 older orders carry `scriptFont: "pinyon"` so they keep the lettering they approved. `scriptFont` pins any invite's script face (customise.ts `scriptFonts`). Great Vibes is also in the font styles as "Graceful".

**Mandir**

- `closingNames`: words in place of the names at the end.
- `hostsLines`
- `nameScale`: allowed range 0.45 to 1.
- `joinerGap` (`{ above, below }` in cqw; the design tucks both at -1): even space around "weds" on the cover when a tall capital crowds it (Rahul & Priya: -0.5 / 3.1).

**Gauri Shankar**

- `heroKicker`: the cover line above the names (in place of "We cordially invite you to the wedding of")
- per function `timeText`: the couple's own wording for the time ("शाम 8:30 से रात 2:00 बजे तक"); the PDF prints it too
- per function `noTime`: the card shows only the day (a ritual with no fixed hour); the PDF follows it
- `welcome`: the family's own line under their lists at the end (Rahul & Pali, AAV-2015)

- `openingLine`
- `justifyMessage`
- `closingLines`
- `venueLines`
- `invocationLines`
- `stackNames`
- `nameNudge` (`{ bride?: em, groom?: em }`)
- `eventOm` (`"maroon"` | `"gold"` | `true`): sacred Om emblem centered in the arch apex above event titles
- the reception cover, shown when `occasion` is `"reception"`

**Chameli**

- `invocationArt`: an image above the mantra on the cover (e.g. `/art/seals/srinita-ganesha.png`).
- `seal`: an image on the wax seal in place of the initials (e.g. `/art/seals/ganesha-white.png`).

**Noor**

- `secondCouple` (`{ groom, bride }`): a second couple marrying on the same day.
- `joiner`, e.g. `"with"`

**PDF:** the layout in src/lib/pdf/layout.ts is at `LAYOUT` v6 (in the pdf route) and follows these settings. Bump `LAYOUT` whenever the layout changes, or cached PDFs keep being served.

**Renaming an invite link**

1. Copy the `invites` row to the new slug, with `data.slug` updated.
2. Point `orders.invite_slug` at the new slug.
3. Add a redirect in `next.config.ts`.
4. Deploy, then delete the old row.

This was done for shamim-family-weddings.

## Shiva Kalyanam: private Telugu design for Srilakshmi & Shiva Chander

- Design file: `src/invites/shivakalyanam.tsx`
- Template entry: `shivakalyanam` in src/data/templates.ts (₹1000, payDirect, noPdf, prefilled form)
- Order form: https://aavjoo.in/start/shivakalyanam
- Live invite: https://aavjoo.in/i/srilakshmi-weds-shiva-chander (AAV-1810)
- Preview page: `/lab/telugu`; branch: `telugu-template`; notes: `art-source/illus/telugu/NOTES.md`
- **Intro:** after the tap, the blessings శ్రీరస్తు / శుభమస్తు / అవిఘ్నమస్తు write in one by one. Keep these. The Vakratunda mantra appears **only** above the Ganesha in the families section.
- The temple doors over the wedding card use `pointer-events-none`. Keep that, or they block the Directions button.

## Couples' RSVP page (from 2026-11-19, 11 PM IST)

- Free for orders placed from `site.rsvpTrackingFrom` with RSVP on. A guest's "Send RSVP on WhatsApp" also saves the reply (`recordRsvp`, src/lib/rsvp-actions.ts) into `rsvp_replies` (migration 0016, run). No phone numbers.
- Couple's page: `/order/<id>/rsvps` (src/app/(site)/order/[id]/rsvps, view in src/site/rsvp-view.tsx). Linked from the order page and emailed right after "your invite is live" (`sendRsvpPageEmail`). A guest who replies twice counts once (latest).
- Preview with sample guests: `/lab/rsvps`. Not yet seen with a real order: check the first new order's page and email.

## SEO: wording pages and free tools (live 2026-11-20)

- 40 wording pages at `/wording/<slug>` (src/data/wordings/*.ts: Haldi, Mehndi, Sangeet, engagement, wedding × English/Hindi × traditional, WhatsApp, from parents, funny), index `/wording`.
- Free tools: `/tools/invitation-wording-generator` (choice after `#fn=…&lang=…&tone=…`) and `/tools/wedding-hashtag-generator`.
- `WORDING_LIVE` (src/data/wordings/index.ts) puts them in the sitemap, footer and guides; bump `WORDING_UPDATED` when the pages change.
- Rules for new SEO pages (from Search Console): self-canonical, unique titles, no `?…` links, no links to `/start/`, real sitemap dates, review a batch before going live.

## SEO keyword plan (from KeywordStats_11_20_2026.csv, paused until after the tech optimisation)

Source: a Bing keyword export (worldwide; check India in Google Keyword Planner / Search Console before building).
- **Skip:** brands (evite, minted, invitae, zola, etsy, canva, vistaprint, the knot, wedding wire, greeting island), head terms (wedding, invitation, invite), unrelated (hiraya manawari, felicitations, "wedding meaning", French/UK queries).
- **Target:** save the date (19.9k/yr), wedding card / card design / cards, wedding invitation card / marriage invitation card, digital wedding invitations (rising), indian wedding invitation card design (rising fast), online wedding invitations / e invitations, wedding invitation website (rising), wedding invitations with rsvp, wedding invitation templates, examples / sample / ideas, invitation maker.
- **Plan:** 1) Retitle the home page and /designs with these words. 2) Six intent landing pages: /digital-wedding-invitations, /wedding-invitation-website, /wedding-invitations-with-rsvp, /indian-wedding-invitation-card-design, /wedding-invitation-templates, /wedding-invitation-examples (each with a demo, price, comparison, FAQs and links; follow the SEO page rules). 3) Save the date category plus its landing page. 4) Showing up in AI answers: quotable facts, product and FAQ markup, `llms.txt`, a comparison page, mentions on other sites (Reddit, Quora, WedMeGood, Instagram). 5) Measure in Search Console 2–3 weeks after each batch.
- **Start with:** step 1, the first three landing pages, and `llms.txt`.

## Next up (owner's list, 2026-11-20)

1. **Save the date** as a category.
2. **Birthday invitation** designs.
3. **Marathi design:** finish it (branch `marathi-template`, `/lab/marathi`).
4. Also pending: the Next.js security upgrade (16.4.2 has an advisory), in its own branch; more wording batches; the first real RSVP-page check.

## Open items

- **Site-wide map links:** 378 live invites use short `maps.app.goo.gl` links, which don't open on some networks. Proposed fix, not yet approved: save the full Google Maps address instead.
- **Shamim family (AAV-1812):** the couple asked for the payment QR. This is for the owner to send.
- **Marathi design:** branch `marathi-template` (`/lab/marathi`).
- `art-source/illus/marathi/` holds rejected drafts and is deliberately untracked.
