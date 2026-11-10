-- The ₹99 "hide Aavjoo branding" add-on can also be bought later from the order page, like the PDF.
-- Run once in the Supabase dashboard: SQL Editor → New query → paste → Run.
alter table addon_purchases drop constraint if exists addon_purchases_addon_check;
alter table addon_purchases add constraint addon_purchases_addon_check check (addon in ('pdf', 'nobrand'));
