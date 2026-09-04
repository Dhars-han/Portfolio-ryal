/*
# Create editable portfolio content

1. New Tables
- `portfolio_content` — stores the single public About and Skills configuration record.
- `id` (text, primary key) — fixed `main` record identifier.
- `about_intro` (text) — About section heading.
- `about_bio` (text array) — About paragraphs shown to visitors.
- `location` (text) — location quick fact.
- `education` (text) — education quick fact.
- `experience_label` (text) — floating experience badge text.
- `skill_categories` (jsonb) — grouped skill names and category names.
- `updated_at` (timestamptz) — last update timestamp.

2. Security
- Enable RLS on `portfolio_content`.
- Allow anonymous and authenticated visitors to read the public record.
- Allow authenticated administrators to insert, update, and delete the record.

3. Important Notes
- This is intentionally a single-tenant portfolio record, so it has no user ownership column.
- The seeded `main` row gives the site usable content before the first admin edit.
*/

CREATE TABLE IF NOT EXISTS portfolio_content (
  id text PRIMARY KEY DEFAULT 'main',
  about_intro text NOT NULL DEFAULT 'Hello! I''m Alex, a software engineer based in San Francisco.',
  about_bio text[] NOT NULL DEFAULT '{}',
  location text NOT NULL DEFAULT 'San Francisco, CA',
  education text NOT NULL DEFAULT 'B.S. Computer Science',
  experience_label text NOT NULL DEFAULT '5+ Years',
  skill_categories jsonb NOT NULL DEFAULT '[]'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE portfolio_content ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_portfolio_content" ON portfolio_content;
CREATE POLICY "public_read_portfolio_content" ON portfolio_content FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "auth_insert_portfolio_content" ON portfolio_content;
CREATE POLICY "auth_insert_portfolio_content" ON portfolio_content FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_portfolio_content" ON portfolio_content;
CREATE POLICY "auth_update_portfolio_content" ON portfolio_content FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_portfolio_content" ON portfolio_content;
CREATE POLICY "auth_delete_portfolio_content" ON portfolio_content FOR DELETE
  TO authenticated USING (true);

INSERT INTO portfolio_content (id, about_intro, about_bio, location, education, experience_label, skill_categories)
VALUES (
  'main',
  'Hello! I''m Alex, a software engineer based in San Francisco.',
  ARRAY[
    'I specialize in building web applications that are not only functional but also delightful to use. My journey started with a curiosity about how things work on the internet, and it evolved into a passion for creating meaningful digital experiences.',
    'With over 5 years of professional experience, I''ve worked with startups and established companies alike, helping them bring their products from concept to launch. I believe great software is born from empathy for the user, attention to detail, and a willingness to iterate.',
    'When I''m not coding, you''ll find me exploring new coffee shops, contributing to open source projects, or mentoring aspiring developers in my community.'
  ],
  'San Francisco, CA',
  'B.S. Computer Science',
  '5+ Years',
  '[
    {"title":"Languages","skills":["JavaScript","TypeScript","Python","Java"]},
    {"title":"Frameworks","skills":["React","Next.js","Node.js / Express","Vue.js"]},
    {"title":"Databases & Cloud","skills":["PostgreSQL","MongoDB","AWS","Docker"]},
    {"title":"Tools","skills":["Git","Figma","Jest / Testing","CI/CD"]}
  ]'::jsonb
)
ON CONFLICT (id) DO NOTHING;
