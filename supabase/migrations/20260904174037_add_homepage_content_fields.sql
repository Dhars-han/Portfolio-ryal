/*
# Add homepage content fields to portfolio_content

1. Modified Tables
- `portfolio_content` — adds columns for hero section and footer customization:
  - `hero_name` (text) — name shown in hero (e.g. "Alex Carter")
  - `hero_tagline` (text) — subtitle under name (e.g. "Full-Stack Developer & UI Engineer")
  - `hero_intro` (text) — short intro paragraph
  - `hero_availability_badge` (text) — text for the availability badge pill
  - `hero_stats` (jsonb) — array of {value, label} stat objects
  - `footer_tagline` (text) — tagline shown in footer
  - `social_links` (jsonb) — array of {label, url} social link objects

2. Security
- No policy changes — existing RLS policies on portfolio_content already cover the new columns.
- Public read, authenticated write (same as before).

3. Important Notes
- All new columns have defaults so the existing row is usable immediately.
- The defaults are seeded with the current hardcoded values so the site looks identical before any admin edit.
*/

ALTER TABLE portfolio_content
  ADD COLUMN IF NOT EXISTS hero_name text NOT NULL DEFAULT 'Alex Carter',
  ADD COLUMN IF NOT EXISTS hero_tagline text NOT NULL DEFAULT 'Full-Stack Developer & UI Engineer',
  ADD COLUMN IF NOT EXISTS hero_intro text NOT NULL DEFAULT 'I craft performant, accessible web applications with clean code and thoughtful design. Passionate about turning complex problems into elegant solutions that users love.',
  ADD COLUMN IF NOT EXISTS hero_availability_badge text NOT NULL DEFAULT 'Available for new opportunities',
  ADD COLUMN IF NOT EXISTS hero_stats jsonb NOT NULL DEFAULT '[{"value":"5+","label":"Years Experience"},{"value":"40+","label":"Projects Shipped"},{"value":"20+","label":"Happy Clients"}]'::jsonb,
  ADD COLUMN IF NOT EXISTS footer_tagline text NOT NULL DEFAULT 'Building digital experiences, one line at a time.',
  ADD COLUMN IF NOT EXISTS social_links jsonb NOT NULL DEFAULT '[{"label":"GitHub","url":"https://github.com"},{"label":"LinkedIn","url":"https://linkedin.com"},{"label":"Twitter","url":"https://twitter.com"},{"label":"Email","url":"mailto:hello@example.com"}]'::jsonb;
