# Google sign-in and couple dashboard

Status: planned, not built. Clickable mock: `mock.html` in this folder (also at https://claude.ai/artifact/PbZmKQ8L2DTZvdA62hYeXy).

## Why
Couples start the order form, get interrupted and come back later on another device. Signing in with Google keeps
their draft safe across devices, gives us their email for reminders, and gives them a dashboard for their invite
and RSVPs.

## Couple side
- **No sign-in at the start.** Nudge after step 2 or 3 ("Save your progress?"), when they return with an unfinished
  draft, and at the final step ("Sign in to track RSVPs"). Never blocks the form.
- **First sign-in:**
  - Google email matches an order's email: straight to that invite.
  - No match: "Find my invite" once (invite link + order number + phone, the same check as `/edit`).
  - Nothing yet: greeting, "Start your invite" (3 steps, ₹249–₹499), design previews, an example RSVP panel marked
    "Example", "Find my order", "Let's talk".
- **Draft:** "Continue your invite · step N of 9" at the top.
- **Live:** invite link (copy, share on WhatsApp), change rounds used, RSVP totals, per-function counts, guest list,
  Excel download.
- **Couples whose invite is already live:** nothing changes unless they sign in. Banner on their order page and a
  Sign in link in the header. RSVPs count from launch day; the dashboard says earlier replies went to WhatsApp.

## RSVPs
Today RSVPs go straight from the guest's phone to WhatsApp and are not stored. To count them, record each RSVP when
the guest taps Send, then open WhatsApp as now.

## Admin side (only these)
- **Orders:** an Account box on each order (Google name/email, how linked, last seen, link to another account,
  unlink, "Copy sign-in invite for WhatsApp"); a 👤 badge and RSVP count in the list.
- **Drafts:** signed-in drafts with design, step and last active; funnel (started → signed in → ordered → paid);
  Remind by email, read-only Preview, Copy WhatsApp nudge.
- **Settings:** on/off switches for Google sign-in, recording RSVPs and draft reminder emails.
- No RSVPs tab and no Accounts tab. Data-deletion requests are handled by hand.

## Effort
- Phase 1, sign-in + drafts + dashboard + admin Orders/Drafts/Settings: about 4 days.
- Phase 2, RSVP recording + dashboard counts: about 2 days.
- Phase 3, draft reminder emails: about 1.5 days.

## Costs and load
- Google sign-in and Supabase Auth: free (Supabase Auth free up to 50,000 monthly users).
- Reminder email (e.g. Resend): free up to 3,000 emails a month.
- Database: drafts about 20 MB/month and RSVPs about 10 MB/month at 100 live invites; trivial.
- Already due regardless: Supabase Pro (US$25/month) as traffic grows; Vercel Pro (US$20/month) because Hobby is
  non-commercial.

## Before building
- Google Cloud project and OAuth consent screen (about 30 minutes, guided).
- Privacy policy update for storing guests' RSVP names (DPDP Act).
