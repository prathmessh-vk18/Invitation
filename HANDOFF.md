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

## Per-invite settings added recently

Use these before writing new code.

**Any design**

- `words`: rewords fixed phrases, keyed by i18n key, e.g. `{ momentsKicker: "Their moments", scratchTitle: "Date and Place" }`. `""` hides a kicker.
- `boldText`: heavier text, and darker ink on Chameli.
- `countdownTitle`
- `noMapSearch`: shows Directions only where the couple gave a map link.
- `occasion: "reception"`
- `lang: "hi"`: the whole invite in Hindi. Mandir, Chameli and the PDF all follow it; translate the couple's own text by hand (names, parents, functions, venues, city, message, closing). Done for anuj-weds-riya, shekhar-weds-meenakshi.
- `video` (`{ src, poster }`): a couple's own finished video plays full screen in place of the design; `template` then only colours the share card. Compress to 1080×1920 H.264 (~15 MB) and upload to R2 `videos/<slug>.mp4` + `.jpg` poster. (Tried for ananya-weds-debi, since deleted: buffered because media.aavjoo.in isn't cached by Cloudflare yet.)

**Mandir**

- `closingNames`: words in place of the names at the end.
- `hostsLines`
- `nameScale`: allowed range 0.45 to 1.

**Gauri Shankar**

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

## Open items

- **Site-wide map links:** 378 live invites use short `maps.app.goo.gl` links, which don't open on some networks. Proposed fix, not yet approved: save the full Google Maps address instead.
- **Shamim family (AAV-1812):** the couple asked for the payment QR. This is for the owner to send.
- **Marathi design:** branch `marathi-template` (`/lab/marathi`).
- `art-source/illus/marathi/` holds rejected drafts and is deliberately untracked.
