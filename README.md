# Aavjoo — wedding invitation websites

Designer invitation websites for Indian weddings. Couples pick a design, reserve on WhatsApp,
and receive one link with every function, venue, song and RSVP.

Built with Next.js 16, Tailwind CSS 4 and Framer Motion.

## Run it

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
```

## Connect Supabase (orders, payments, admin)

1. Create a project at [supabase.com](https://supabase.com) (region: Mumbai is closest for India).
2. In the dashboard open **SQL Editor → New query**, paste `supabase/migrations/0001_orders_and_invites.sql`
   and press **Run**. This creates the `orders` and `invites` tables and the `songs` storage bucket.
3. Copy `.env.example` to `.env.local` and fill it in from **Project Settings → API**, plus an admin
   password and a random session secret (`openssl rand -hex 32`).
4. Set your business UPI ID in `src/config/site.ts` (`upiId`, `upiPayee`).
5. Restart `npm run dev`. On Vercel, add the same variables under **Settings → Environment Variables**.

### The order flow

1. A couple opens a design and presses **Customise this design** (`/start/<design>`), fills the form
   with a live preview, uploads a song and picks add-ons.
2. **Continue to payment** saves the order and opens `/order/<id>`: a UPI QR with the amount and order
   code filled in, and a box for the 12-digit UTR.
3. In `/admin`, check the UTR against your bank app, press **Payment received**, then
   **Create invite**. The invite goes live at `/i/<address>` until 15 days after the wedding.
4. Press **Send link on WhatsApp** to message the couple.

## What's where

| Path | What |
| --- | --- |
| `src/app/(site)/` | Marketing site: home, designs, category pages, design detail pages, custom, about, legal |
| `src/app/i/[slug]/` | The invitation guests open, e.g. `/i/aarav-weds-meera` |
| `src/app/design-system/` | Live style guide for the site |
| `src/invites/` | The invitation templates (Rajwada, Gulmohar, Agni, Noor, Phulkari, Kolam) |
| `src/art/` | Code-drawn ornaments, glyphs and patterns used by templates |
| `src/ui/` | Site design-system components — rules in [DESIGN.md](DESIGN.md) |
| `src/site/` | Site sections, gallery, header/footer, add-on picker |
| `src/data/` | Templates, categories and demo invites |
| `src/config/` | Brand details, prices and add-ons |

## Before launch

- Replace placeholder brand details, WhatsApp number and prices in `src/config/site.ts`,
  `src/config/addons.ts` and `src/data/templates.ts`.
- Replace the yellow `[placeholder]` stats and testimonials with real ones.
- Have the legal pages (`/privacy`, `/refunds`, `/terms`) reviewed.

## Adding a customer's invite

Add an entry to `src/data/invites.ts` with a `slug` and a `template` id. It is published at
`/i/<slug>`.

## Adding a template

Create `src/invites/<name>.tsx` implementing `InviteTheme`, register it in
`src/invites/registry.ts`, add its metadata to `src/data/templates.ts` and a demo invite to
`src/data/invites.ts`. Templates are free to ignore the site design system.
