import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export type Project = {
  id: string;
  title: string;
  description: string;
  long_description: string | null;
  tech_stack: string[];
  image_url: string | null;
  live_url: string | null;
  github_url: string | null;
  featured: boolean;
  created_at: string;
};

export type Message = {
  id: string;
  name: string;
  email: string;
  message: string;
  submitted_at: string;
};

export type SkillCategory = {
  title: string;
  skills: string[];
};

export type HeroStat = {
  value: string;
  label: string;
};

export type SocialLink = {
  label: string;
  url: string;
};

export type PortfolioContent = {
  id: string;
  about_intro: string;
  about_bio: string[];
  location: string;
  education: string;
  experience_label: string;
  skill_categories: SkillCategory[];
  hero_name: string;
  hero_tagline: string;
  hero_intro: string;
  hero_availability_badge: string;
  hero_stats: HeroStat[];
  footer_tagline: string;
  social_links: SocialLink[];
  updated_at: string;
};
