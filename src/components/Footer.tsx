import { useEffect, useState } from 'react';
import { Code2, Github, Linkedin, Mail, Twitter, Globe } from 'lucide-react';
import { supabase, type PortfolioContent, type SocialLink } from '@/lib/supabase';

type FooterProps = {
  onNavigate: (page: string) => void;
};

function iconForLabel(label: string): typeof Github {
  const lower = label.toLowerCase();
  if (lower.includes('github')) return Github;
  if (lower.includes('linkedin')) return Linkedin;
  if (lower.includes('twitter')) return Twitter;
  if (lower.includes('mail') || lower.includes('email')) return Mail;
  return Globe;
}

export function Footer({ onNavigate }: FooterProps) {
  const [content, setContent] = useState<PortfolioContent | null>(null);

  useEffect(() => {
    supabase
      .from('portfolio_content')
      .select('*')
      .eq('id', 'main')
      .maybeSingle()
      .then(({ data }) => {
        setContent(data as PortfolioContent | null);
      });
  }, []);

  const tagline = content?.footer_tagline ?? 'Building digital experiences, one line at a time.';
  const links: SocialLink[] = content?.social_links ?? [];

  return (
    <footer className="border-t border-gray-200/60 bg-gray-50 dark:border-gray-800/60 dark:bg-gray-950">
      <div className="mx-auto max-w-6xl px-6 py-12 md:px-12">
        <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
          <div className="flex flex-col items-center gap-3 md:items-start">
            <button
              onClick={() => onNavigate('home')}
              className="flex items-center gap-2 text-lg font-bold"
            >
              <Code2 className="h-5 w-5 text-primary-500" />
              Portfolio
            </button>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {tagline}
            </p>
          </div>

          <div className="flex gap-3">
            {links.map((link) => {
              const Icon = iconForLabel(link.label);
              return (
                <a
                  key={link.label}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={link.label}
                  className="rounded-lg border border-gray-200 p-2.5 text-gray-600 transition-all hover:border-primary-400 hover:text-primary-500 dark:border-gray-800 dark:text-gray-400 dark:hover:border-primary-400 dark:hover:text-primary-400"
                >
                  <Icon className="h-4 w-4" />
                </a>
              );
            })}
          </div>
        </div>

        <div className="mt-8 border-t border-gray-200/60 pt-6 text-center dark:border-gray-800/60">
          <p className="text-sm text-gray-400 dark:text-gray-500">
            © {new Date().getFullYear()} Portfolio. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
