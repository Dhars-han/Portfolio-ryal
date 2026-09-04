import { useEffect, useState, type FormEvent } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Loader2,
  LogOut,
  ArrowLeft,
  Star,
  Mail,
  Inbox,
  LayoutGrid,
  User,
  Zap,
  Home,
} from 'lucide-react';
import { supabase, type Project, type Message, type PortfolioContent, type SkillCategory, type HeroStat, type SocialLink } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';

type DashboardProps = {
  onBack: () => void;
};

type Tab = 'projects' | 'messages' | 'about' | 'skills' | 'home';

type EditForm = {
  title: string;
  description: string;
  long_description: string;
  tech_stack: string;
  image_url: string;
  live_url: string;
  github_url: string;
  featured: boolean;
};

const EMPTY_FORM: EditForm = {
  title: '',
  description: '',
  long_description: '',
  tech_stack: '',
  image_url: '',
  live_url: '',
  github_url: '',
  featured: false,
};

export function AdminDashboard({ onBack }: DashboardProps) {
  const { signOut } = useAuth();
  const [tab, setTab] = useState<Tab>('projects');
  const [projects, setProjects] = useState<Project[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [content, setContent] = useState<PortfolioContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Project | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<EditForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    fetchProjects();
    fetchMessages();
    fetchContent();
  }, []);

  const fetchProjects = async () => {
    const { data } = await supabase.from('projects').select('*').order('created_at', { ascending: false });
    setProjects(data ?? []);
    setLoading(false);
  };

  const fetchMessages = async () => {
    const { data } = await supabase.from('messages').select('*').order('submitted_at', { ascending: false });
    setMessages(data ?? []);
  };

  const fetchContent = async () => {
    const { data } = await supabase.from('portfolio_content').select('*').eq('id', 'main').maybeSingle();
    setContent(data as PortfolioContent | null);
  };

  const openAdd = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFormError(null);
    setShowForm(true);
  };

  const openEdit = (project: Project) => {
    setEditing(project);
    setForm({
      title: project.title,
      description: project.description,
      long_description: project.long_description ?? '',
      tech_stack: project.tech_stack.join(', '),
      image_url: project.image_url ?? '',
      live_url: project.live_url ?? '',
      github_url: project.github_url ?? '',
      featured: project.featured,
    });
    setFormError(null);
    setShowForm(true);
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) {
      setFormError('Title and description are required.');
      return;
    }

    setSaving(true);
    setFormError(null);

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      long_description: form.long_description.trim() || null,
      tech_stack: form.tech_stack.split(',').map((t) => t.trim()).filter(Boolean),
      image_url: form.image_url.trim() || null,
      live_url: form.live_url.trim() || null,
      github_url: form.github_url.trim() || null,
      featured: form.featured,
    };

    if (editing) {
      const { error } = await supabase.from('projects').update(payload).eq('id', editing.id);
      if (error) {
        setFormError(error.message);
        setSaving(false);
        return;
      }
    } else {
      const { error } = await supabase.from('projects').insert(payload);
      if (error) {
        setFormError(error.message);
        setSaving(false);
        return;
      }
    }

    setShowForm(false);
    setSaving(false);
    fetchProjects();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const { error } = await supabase.from('projects').delete().eq('id', deleteId);
    if (!error) {
      fetchProjects();
    }
    setDeleteId(null);
  };

  const handleDeleteMessage = async (id: string) => {
    await supabase.from('messages').delete().eq('id', id);
    fetchMessages();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-gray-200/60 bg-white/80 backdrop-blur-md dark:border-gray-800/60 dark:bg-gray-950/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-sm text-gray-500 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Site
            </button>
            <span className="hidden text-gray-300 sm:inline dark:text-gray-700">|</span>
            <h1 className="hidden text-lg font-bold sm:block">Admin Dashboard</h1>
          </div>

          <button
            onClick={() => signOut()}
            className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-8">
        {/* Tabs */}
        <div className="flex flex-wrap gap-2 rounded-xl border border-gray-200/60 bg-white p-1 dark:border-gray-800/60 dark:bg-gray-900">
          <TabButton active={tab === 'projects'} onClick={() => setTab('projects')} icon={LayoutGrid} label={`Projects (${projects.length})`} />
          <TabButton active={tab === 'messages'} onClick={() => setTab('messages')} icon={Inbox} label={`Messages (${messages.length})`} />
          <TabButton active={tab === 'home'} onClick={() => setTab('home')} icon={Home} label="Home" />
          <TabButton active={tab === 'about'} onClick={() => setTab('about')} icon={User} label="About" />
          <TabButton active={tab === 'skills'} onClick={() => setTab('skills')} icon={Zap} label="Skills" />
        </div>

        {/* Projects tab */}
        {tab === 'projects' && (
          <div className="mt-8">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold">Manage Projects</h2>
              <button onClick={openAdd} className="btn-primary">
                <Plus className="h-4 w-4" />
                Add Project
              </button>
            </div>

            {loading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
              </div>
            ) : projects.length === 0 ? (
              <div className="glass-card p-12 text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No projects yet. Click "Add Project" to create your first one.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {projects.map((project) => (
                  <div key={project.id} className="glass-card overflow-hidden">
                    <div className="relative h-36 overflow-hidden">
                      {project.image_url ? (
                        <img
                          src={project.image_url}
                          alt={project.title}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary-500/20 to-accent-500/20">
                          <span className="text-xl font-bold text-gray-400">
                            {project.title[0]}
                          </span>
                        </div>
                      )}
                      {project.featured && (
                        <div className="absolute top-2 left-2 flex items-center gap-1 rounded-full bg-accent-500 px-2 py-0.5 text-xs font-semibold text-white">
                          <Star className="h-3 w-3 fill-white" />
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold">{project.title}</h3>
                      <p className="mt-1 line-clamp-2 text-xs text-gray-500 dark:text-gray-400">
                        {project.description}
                      </p>
                      <div className="mt-3 flex gap-2">
                        <button
                          onClick={() => openEdit(project)}
                          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-gray-200 py-2 text-xs font-medium transition-colors hover:border-primary-400 hover:text-primary-500 dark:border-gray-700"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          Edit
                        </button>
                        <button
                          onClick={() => setDeleteId(project.id)}
                          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-gray-200 py-2 text-xs font-medium text-error-500 transition-colors hover:border-error-400 hover:bg-error-500/5 dark:border-gray-700"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Messages tab */}
        {tab === 'messages' && (
          <div className="mt-8">
            <h2 className="mb-6 text-xl font-bold">Contact Messages</h2>
            {messages.length === 0 ? (
              <div className="glass-card p-12 text-center">
                <Mail className="mx-auto h-10 w-10 text-gray-300 dark:text-gray-700" />
                <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                  No messages yet. When visitors submit the contact form, they'll appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((msg) => (
                  <div key={msg.id} className="glass-card p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold">{msg.name}</h3>
                          <span className="text-xs text-gray-400 dark:text-gray-500">
                            {new Date(msg.submitted_at).toLocaleDateString(undefined, {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <a
                          href={`mailto:${msg.email}`}
                          className="text-sm text-primary-600 hover:underline dark:text-primary-400"
                        >
                          {msg.email}
                        </a>
                        <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                          {msg.message}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeleteMessage(msg.id)}
                        className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-error-500/10 hover:text-error-500"
                        aria-label="Delete message"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Home tab */}
        {tab === 'home' && <HomeEditor content={content} onSaved={fetchContent} />}

        {/* About tab */}
        {tab === 'about' && <AboutEditor content={content} onSaved={fetchContent} />}

        {/* Skills tab */}
        {tab === 'skills' && <SkillsEditor content={content} onSaved={fetchContent} />}
      </div>

      {/* Add/Edit modal */}
      {showForm && (
        <ProjectFormModal
          form={form}
          setForm={setForm}
          editing={editing}
          saving={saving}
          error={formError}
          onSubmit={handleSave}
          onClose={() => setShowForm(false)}
        />
      )}

      {/* Delete confirmation */}
      {deleteId && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-fade-in"
          onClick={() => setDeleteId(null)}
        >
          <div
            className="animate-scale-in w-full max-w-sm rounded-2xl border border-gray-200/60 bg-white p-6 shadow-2xl dark:border-gray-800/60 dark:bg-gray-900"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-error-500/10 text-error-500">
              <Trash2 className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-lg font-bold">Delete this project?</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              This action cannot be undone.
            </p>
            <div className="mt-6 flex gap-3">
              <button onClick={() => setDeleteId(null)} className="btn-secondary flex-1">
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-error-500 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-error-600 active:scale-95"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof LayoutGrid;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
        active
          ? 'bg-primary-600 text-white shadow-md shadow-primary-600/25'
          : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
      }`}
    >
      <Icon className="h-4 w-4" />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

/* ---------- Home Editor ---------- */

function HomeEditor({ content, onSaved }: { content: PortfolioContent | null; onSaved: () => void }) {
  const [name, setName] = useState('');
  const [tagline, setTagline] = useState('');
  const [intro, setIntro] = useState('');
  const [badge, setBadge] = useState('');
  const [stats, setStats] = useState<HeroStat[]>([{ value: '', label: '' }]);
  const [footerTagline, setFooterTagline] = useState('');
  const [socials, setSocials] = useState<SocialLink[]>([{ label: '', url: '' }]);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState(false);

  useEffect(() => {
    if (content) {
      setName(content.hero_name);
      setTagline(content.hero_tagline);
      setIntro(content.hero_intro);
      setBadge(content.hero_availability_badge);
      setStats(content.hero_stats.length > 0 ? content.hero_stats : [{ value: '', label: '' }]);
      setFooterTagline(content.footer_tagline);
      setSocials(content.social_links.length > 0 ? content.social_links : [{ label: '', url: '' }]);
    }
  }, [content]);

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedMsg(false);

    const cleanedStats = stats
      .map((s) => ({ value: s.value.trim(), label: s.label.trim() }))
      .filter((s) => s.value && s.label);

    const cleanedSocials = socials
      .map((s) => ({ label: s.label.trim(), url: s.url.trim() }))
      .filter((s) => s.label && s.url);

    const { error } = await supabase
      .from('portfolio_content')
      .update({
        hero_name: name.trim(),
        hero_tagline: tagline.trim(),
        hero_intro: intro.trim(),
        hero_availability_badge: badge.trim(),
        hero_stats: JSON.parse(JSON.stringify(cleanedStats)),
        footer_tagline: footerTagline.trim(),
        social_links: JSON.parse(JSON.stringify(cleanedSocials)),
        updated_at: new Date().toISOString(),
      })
      .eq('id', 'main');

    if (!error) {
      setSavedMsg(true);
      onSaved();
      setTimeout(() => setSavedMsg(false), 3000);
    }
    setSaving(false);
  };

  return (
    <div className="mt-8">
      <h2 className="mb-6 text-xl font-bold">Edit Homepage / Hero</h2>
      <form onSubmit={handleSave} className="glass-card max-w-2xl space-y-5 p-6">
        <div>
          <label className="mb-1.5 block text-sm font-medium">Your Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input-field"
            placeholder="Alex Carter"
            disabled={saving}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium">Tagline / Role</label>
          <input
            type="text"
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
            className="input-field"
            placeholder="Full-Stack Developer & UI Engineer"
            disabled={saving}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium">Short Intro</label>
          <textarea
            rows={3}
            value={intro}
            onChange={(e) => setIntro(e.target.value)}
            className="input-field resize-none"
            placeholder="I craft performant, accessible web applications..."
            disabled={saving}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium">Availability Badge Text</label>
          <input
            type="text"
            value={badge}
            onChange={(e) => setBadge(e.target.value)}
            className="input-field"
            placeholder="Available for new opportunities"
            disabled={saving}
          />
          <p className="mt-1 text-xs text-gray-400">Leave empty to hide the badge.</p>
        </div>

        {/* Stats editor */}
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label className="text-sm font-medium">Hero Stats</label>
            <button
              type="button"
              onClick={() => setStats([...stats, { value: '', label: '' }])}
              className="flex items-center gap-1 text-xs font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400"
            >
              <Plus className="h-3.5 w-3.5" />
              Add stat
            </button>
          </div>
          <div className="space-y-2">
            {stats.map((stat, i) => (
              <div key={i} className="flex gap-2">
                <input
                  type="text"
                  value={stat.value}
                  onChange={(e) => {
                    const next = [...stats];
                    next[i] = { ...next[i], value: e.target.value };
                    setStats(next);
                  }}
                  className="input-field w-24"
                  placeholder="5+"
                  disabled={saving}
                />
                <input
                  type="text"
                  value={stat.label}
                  onChange={(e) => {
                    const next = [...stats];
                    next[i] = { ...next[i], label: e.target.value };
                    setStats(next);
                  }}
                  className="input-field flex-1"
                  placeholder="Years Experience"
                  disabled={saving}
                />
                {stats.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setStats(stats.filter((_, idx) => idx !== i))}
                    className="shrink-0 rounded-lg border border-gray-200 p-2 text-gray-400 transition-colors hover:border-error-400 hover:text-error-500 dark:border-gray-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200/60 pt-5 dark:border-gray-800/60">
          <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-gray-400">Footer</h3>

          <div className="mb-4">
            <label className="mb-1.5 block text-sm font-medium">Footer Tagline</label>
            <input
              type="text"
              value={footerTagline}
              onChange={(e) => setFooterTagline(e.target.value)}
              className="input-field"
              placeholder="Building digital experiences, one line at a time."
              disabled={saving}
            />
          </div>

          {/* Social links editor */}
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="text-sm font-medium">Social Links</label>
              <button
                type="button"
                onClick={() => setSocials([...socials, { label: '', url: '' }])}
                className="flex items-center gap-1 text-xs font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400"
              >
                <Plus className="h-3.5 w-3.5" />
                Add link
              </button>
            </div>
            <div className="space-y-2">
              {socials.map((social, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    type="text"
                    value={social.label}
                    onChange={(e) => {
                      const next = [...socials];
                      next[i] = { ...next[i], label: e.target.value };
                      setSocials(next);
                    }}
                    className="input-field w-32"
                    placeholder="GitHub"
                    disabled={saving}
                  />
                  <input
                    type="url"
                    value={social.url}
                    onChange={(e) => {
                      const next = [...socials];
                      next[i] = { ...next[i], url: e.target.value };
                      setSocials(next);
                    }}
                    className="input-field flex-1"
                    placeholder="https://github.com/yourusername"
                    disabled={saving}
                  />
                  {socials.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setSocials(socials.filter((_, idx) => idx !== i))}
                      className="shrink-0 rounded-lg border border-gray-200 p-2 text-gray-400 transition-colors hover:border-error-400 hover:text-error-500 dark:border-gray-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {savedMsg && (
          <div className="rounded-xl bg-accent-500/10 px-4 py-3 text-sm text-accent-600 dark:text-accent-400">
            Saved! Your homepage is now live.
          </div>
        )}

        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Changes'
          )}
        </button>
      </form>
    </div>
  );
}

/* ---------- About Editor ---------- */

function AboutEditor({ content, onSaved }: { content: PortfolioContent | null; onSaved: () => void }) {
  const [intro, setIntro] = useState('');
  const [bioParas, setBioParas] = useState<string[]>(['']);
  const [location, setLocation] = useState('');
  const [education, setEducation] = useState('');
  const [expLabel, setExpLabel] = useState('');
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState(false);

  useEffect(() => {
    if (content) {
      setIntro(content.about_intro);
      setBioParas(content.about_bio.length > 0 ? content.about_bio : ['']);
      setLocation(content.location);
      setEducation(content.education);
      setExpLabel(content.experience_label);
    }
  }, [content]);

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedMsg(false);
    const { error } = await supabase
      .from('portfolio_content')
      .update({
        about_intro: intro.trim(),
        about_bio: bioParas.map((p) => p.trim()).filter(Boolean),
        location: location.trim(),
        education: education.trim(),
        experience_label: expLabel.trim(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', 'main');

    if (!error) {
      setSavedMsg(true);
      onSaved();
      setTimeout(() => setSavedMsg(false), 3000);
    }
    setSaving(false);
  };

  return (
    <div className="mt-8">
      <h2 className="mb-6 text-xl font-bold">Edit About Section</h2>
      <form onSubmit={handleSave} className="glass-card max-w-2xl space-y-5 p-6">
        <div>
          <label className="mb-1.5 block text-sm font-medium">Intro Heading</label>
          <input
            type="text"
            value={intro}
            onChange={(e) => setIntro(e.target.value)}
            className="input-field"
            placeholder="Hello! I'm Alex, a software engineer based in San Francisco."
            disabled={saving}
          />
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label className="text-sm font-medium">Bio Paragraphs</label>
            <button
              type="button"
              onClick={() => setBioParas([...bioParas, ''])}
              className="flex items-center gap-1 text-xs font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400"
            >
              <Plus className="h-3.5 w-3.5" />
              Add paragraph
            </button>
          </div>
          <div className="space-y-3">
            {bioParas.map((para, i) => (
              <div key={i} className="flex gap-2">
                <textarea
                  rows={3}
                  value={para}
                  onChange={(e) => {
                    const next = [...bioParas];
                    next[i] = e.target.value;
                    setBioParas(next);
                  }}
                  className="input-field resize-none"
                  placeholder={`Paragraph ${i + 1}...`}
                  disabled={saving}
                />
                {bioParas.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setBioParas(bioParas.filter((_, idx) => idx !== i))}
                    className="shrink-0 rounded-lg border border-gray-200 p-2 text-gray-400 transition-colors hover:border-error-400 hover:text-error-500 dark:border-gray-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium">Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="input-field"
              disabled={saving}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Education</label>
            <input
              type="text"
              value={education}
              onChange={(e) => setEducation(e.target.value)}
              className="input-field"
              disabled={saving}
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium">Experience Badge Label</label>
          <input
            type="text"
            value={expLabel}
            onChange={(e) => setExpLabel(e.target.value)}
            className="input-field"
            placeholder="5+ Years"
            disabled={saving}
          />
        </div>

        {savedMsg && (
          <div className="rounded-xl bg-accent-500/10 px-4 py-3 text-sm text-accent-600 dark:text-accent-400">
            Saved! Your About section is now live.
          </div>
        )}

        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Changes'
          )}
        </button>
      </form>
    </div>
  );
}

/* ---------- Skills Editor ---------- */

function SkillsEditor({ content, onSaved }: { content: PortfolioContent | null; onSaved: () => void }) {
  const [categories, setCategories] = useState<SkillCategory[]>([{ title: '', skills: [''] }]);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState(false);

  useEffect(() => {
    if (content?.skill_categories && content.skill_categories.length > 0) {
      setCategories(content.skill_categories.map((c) => ({ ...c, skills: c.skills.length > 0 ? c.skills : [''] })));
    }
  }, [content]);

  const updateCategoryTitle = (idx: number, title: string) => {
    setCategories((prev) => prev.map((c, i) => (i === idx ? { ...c, title } : c)));
  };

  const updateSkill = (catIdx: number, skillIdx: number, value: string) => {
    setCategories((prev) =>
      prev.map((c, i) =>
        i === catIdx ? { ...c, skills: c.skills.map((s, j) => (j === skillIdx ? value : s)) } : c
      )
    );
  };

  const addSkill = (catIdx: number) => {
    setCategories((prev) => prev.map((c, i) => (i === catIdx ? { ...c, skills: [...c.skills, ''] } : c)));
  };

  const removeSkill = (catIdx: number, skillIdx: number) => {
    setCategories((prev) =>
      prev.map((c, i) =>
        i === catIdx ? { ...c, skills: c.skills.filter((_, j) => j !== skillIdx) } : c
      )
    );
  };

  const addCategory = () => {
    setCategories((prev) => [...prev, { title: '', skills: [''] }]);
  };

  const removeCategory = (catIdx: number) => {
    setCategories((prev) => prev.filter((_, i) => i !== catIdx));
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedMsg(false);

    const cleaned = categories
      .map((c) => ({
        title: c.title.trim(),
        skills: c.skills.map((s) => s.trim()).filter(Boolean),
      }))
      .filter((c) => c.title && c.skills.length > 0);

    const { error } = await supabase
      .from('portfolio_content')
      .update({
        skill_categories: JSON.parse(JSON.stringify(cleaned)),
        updated_at: new Date().toISOString(),
      })
      .eq('id', 'main');

    if (!error) {
      setSavedMsg(true);
      onSaved();
      setTimeout(() => setSavedMsg(false), 3000);
    }
    setSaving(false);
  };

  return (
    <div className="mt-8">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-bold">Edit Skills Section</h2>
        <button type="button" onClick={addCategory} className="btn-secondary">
          <Plus className="h-4 w-4" />
          Add Category
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        {categories.map((cat, catIdx) => (
          <div key={catIdx} className="glass-card p-5">
            <div className="mb-4 flex items-center gap-3">
              <input
                type="text"
                value={cat.title}
                onChange={(e) => updateCategoryTitle(catIdx, e.target.value)}
                className="input-field flex-1 font-semibold"
                placeholder="Category name (e.g. Languages)"
                disabled={saving}
              />
              {categories.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeCategory(catIdx)}
                  className="shrink-0 rounded-lg border border-gray-200 p-2.5 text-gray-400 transition-colors hover:border-error-400 hover:text-error-500 dark:border-gray-700"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="space-y-2">
              {cat.skills.map((skill, skillIdx) => (
                <div key={skillIdx} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={skill}
                    onChange={(e) => updateSkill(catIdx, skillIdx, e.target.value)}
                    className="input-field"
                    placeholder="Skill name (e.g. Python)"
                    disabled={saving}
                  />
                  {cat.skills.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSkill(catIdx, skillIdx)}
                      className="shrink-0 rounded-lg p-2 text-gray-400 transition-colors hover:text-error-500"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => addSkill(catIdx)}
              className="mt-3 flex items-center gap-1 text-xs font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400"
            >
              <Plus className="h-3.5 w-3.5" />
              Add skill
            </button>
          </div>
        ))}

        {savedMsg && (
          <div className="rounded-xl bg-accent-500/10 px-4 py-3 text-sm text-accent-600 dark:text-accent-400">
            Saved! Your Skills section is now live.
          </div>
        )}

        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Changes'
          )}
        </button>
      </form>
    </div>
  );
}

/* ---------- Project Form Modal ---------- */

function ProjectFormModal({
  form,
  setForm,
  editing,
  saving,
  error,
  onSubmit,
  onClose,
}: {
  form: EditForm;
  setForm: (f: EditForm) => void;
  editing: Project | null;
  saving: boolean;
  error: string | null;
  onSubmit: (e: FormEvent) => void;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="animate-scale-in max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-gray-200/60 bg-white shadow-2xl dark:border-gray-800/60 dark:bg-gray-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-200/60 px-6 py-4 dark:border-gray-800/60">
          <h3 className="text-lg font-bold">{editing ? 'Edit Project' : 'Add Project'}</h3>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4 p-6">
          <div>
            <label className="mb-1.5 block text-sm font-medium">Title *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="input-field"
              required
              disabled={saving}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">Short Description *</label>
            <textarea
              rows={2}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="input-field resize-none"
              required
              disabled={saving}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">Long Description</label>
            <textarea
              rows={4}
              value={form.long_description}
              onChange={(e) => setForm({ ...form, long_description: e.target.value })}
              className="input-field resize-none"
              placeholder="Expanded description shown in the detail view..."
              disabled={saving}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">Tech Stack (comma-separated)</label>
            <input
              type="text"
              value={form.tech_stack}
              onChange={(e) => setForm({ ...form, tech_stack: e.target.value })}
              className="input-field"
              placeholder="React, TypeScript, Node.js"
              disabled={saving}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Image URL</label>
              <input
                type="url"
                value={form.image_url}
                onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                className="input-field"
                placeholder="https://..."
                disabled={saving}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Live Demo URL</label>
              <input
                type="url"
                value={form.live_url}
                onChange={(e) => setForm({ ...form, live_url: e.target.value })}
                className="input-field"
                placeholder="https://..."
                disabled={saving}
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">GitHub URL</label>
            <input
              type="url"
              value={form.github_url}
              onChange={(e) => setForm({ ...form, github_url: e.target.value })}
              className="input-field"
              placeholder="https://github.com/..."
              disabled={saving}
            />
          </div>

          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-gray-200/60 px-4 py-3 dark:border-gray-800/60">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(e) => setForm({ ...form, featured: e.target.checked })}
              className="h-4 w-4 rounded accent-primary-600"
              disabled={saving}
            />
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-accent-500" />
              <span className="text-sm font-medium">Featured project</span>
            </div>
          </label>

          {error && (
            <div className="rounded-xl bg-error-500/10 px-4 py-3 text-sm text-error-600 dark:text-error-400">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1" disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="btn-primary flex-1" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : editing ? (
                'Save Changes'
              ) : (
                'Create Project'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
