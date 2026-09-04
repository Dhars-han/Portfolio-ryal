/*
# Create portfolio tables (projects + messages)

1. New Tables
- `projects`
  - `id` (uuid, primary key)
  - `title` (text, not null) — project name
  - `description` (text, not null) — short description for cards
  - `long_description` (text) — expanded description for detail view
  - `tech_stack` (text array) — list of technologies used
  - `image_url` (text) — thumbnail image URL
  - `live_url` (text) — live demo link
  - `github_url` (text) — source code link
  - `featured` (boolean, default false) — whether to highlight on home page
  - `created_at` (timestamptz, default now())
- `messages`
  - `id` (uuid, primary key)
  - `name` (text, not null) — sender name
  - `email` (text, not null) — sender email
  - `message` (text, not null) — message body
  - `submitted_at` (timestamptz, default now())

2. Security
- Enable RLS on both tables.
- projects: public can read (anon + authenticated SELECT true). Only authenticated users can insert/update/delete (admin via Supabase auth).
- messages: anyone can insert (contact form). Only authenticated users can read/delete (admin views messages in dashboard).
*/

CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  long_description text,
  tech_stack text[] DEFAULT '{}',
  image_url text,
  live_url text,
  github_url text,
  featured boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  message text NOT NULL,
  submitted_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Projects: public read
DROP POLICY IF EXISTS "public_read_projects" ON projects;
CREATE POLICY "public_read_projects" ON projects FOR SELECT
  TO anon, authenticated USING (true);

-- Projects: admin write (insert/update/delete) — must be authenticated
DROP POLICY IF EXISTS "auth_insert_projects" ON projects;
CREATE POLICY "auth_insert_projects" ON projects FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_projects" ON projects;
CREATE POLICY "auth_update_projects" ON projects FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_projects" ON projects;
CREATE POLICY "auth_delete_projects" ON projects FOR DELETE
  TO authenticated USING (true);

-- Messages: anyone can submit (contact form)
DROP POLICY IF EXISTS "anon_insert_messages" ON messages;
CREATE POLICY "anon_insert_messages" ON messages FOR INSERT
  TO anon, authenticated WITH CHECK (true);

-- Messages: only authenticated (admin) can read
DROP POLICY IF EXISTS "auth_read_messages" ON messages;
CREATE POLICY "auth_read_messages" ON messages FOR SELECT
  TO authenticated USING (true);

-- Messages: only authenticated (admin) can delete
DROP POLICY IF EXISTS "auth_delete_messages" ON messages;
CREATE POLICY "auth_delete_messages" ON messages FOR DELETE
  TO authenticated USING (true);

-- Index for ordering projects by created_at
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_submitted_at ON messages (submitted_at DESC);
