import { useState, type FormEvent } from 'react';
import { Send, Loader2, CheckCircle, AlertCircle, Mail, MapPin, Github, Linkedin } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useScrollReveal } from '@/hooks/useScrollReveal';

type Status = 'idle' | 'loading' | 'success' | 'error';

export function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [ref, visible] = useScrollReveal<HTMLDivElement>();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setStatus('error');
      setErrorMsg('Please fill in all fields.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      setStatus('error');
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    setStatus('loading');
    setErrorMsg('');

    const { error } = await supabase.from('messages').insert({
      name: form.name.trim(),
      email: form.email.trim(),
      message: form.message.trim(),
    });

    if (error) {
      setStatus('error');
      setErrorMsg('Something went wrong. Please try again.');
      return;
    }

    setStatus('success');
    setForm({ name: '', email: '', message: '' });
    setTimeout(() => setStatus('idle'), 5000);
  };

  return (
    <section id="contact" className="section-padding bg-gray-50 dark:bg-gray-900/30">
      <div className="container-max">
        <div ref={ref} className={`reveal ${visible ? 'visible' : ''} text-center`}>
          <h2 className="section-title">
            Get In <span className="gradient-text">Touch</span>
          </h2>
          <p className="section-subtitle">
            Have a project in mind or just want to say hello? I'd love to hear from you.
          </p>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-5">
          {/* Contact info */}
          <div className="md:col-span-2">
            <div className="glass-card h-full p-6">
              <h3 className="text-xl font-bold">Let's talk</h3>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Whether you have a question about my work, want to discuss a collaboration, or just
                want to connect, feel free to reach out.
              </p>

              <div className="mt-6 space-y-4">
                <a
                  href="mailto:hello@example.com"
                  className="flex items-center gap-3 rounded-xl p-3 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-500/10 text-primary-600 dark:text-primary-400">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Email</div>
                    <div className="text-sm font-semibold">hello@example.com</div>
                  </div>
                </a>

                <div className="flex items-center gap-3 rounded-xl p-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-500/10 text-accent-600 dark:text-accent-400">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Location</div>
                    <div className="text-sm font-semibold">San Francisco, CA</div>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  {[
                    { icon: Github, href: 'https://github.com', label: 'GitHub' },
                    { icon: Linkedin, href: 'https://linkedin.com', label: 'LinkedIn' },
                  ].map(({ icon: Icon, href, label }) => (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 text-gray-600 transition-all hover:border-primary-400 hover:text-primary-500 dark:border-gray-800 dark:text-gray-400"
                    >
                      <Icon className="h-4 w-4" />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Contact form */}
          <div className="md:col-span-3">
            <form onSubmit={handleSubmit} className="glass-card space-y-5 p-6 md:p-8">
              <div>
                <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Your name"
                  className="input-field"
                  disabled={status === 'loading'}
                />
              </div>

              <div>
                <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="you@example.com"
                  className="input-field"
                  disabled={status === 'loading'}
                />
              </div>

              <div>
                <label htmlFor="message" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Message
                </label>
                <textarea
                  id="message"
                  rows={5}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="Tell me about your project or just say hi..."
                  className="input-field resize-none"
                  disabled={status === 'loading'}
                />
              </div>

              {/* Status messages */}
              {status === 'error' && (
                <div className="flex items-center gap-2 rounded-xl bg-error-500/10 px-4 py-3 text-sm text-error-600 dark:text-error-400">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {errorMsg}
                </div>
              )}

              {status === 'success' && (
                <div className="flex items-center gap-2 rounded-xl bg-accent-500/10 px-4 py-3 text-sm text-accent-600 dark:text-accent-400">
                  <CheckCircle className="h-4 w-4 shrink-0" />
                  Thank you! Your message has been sent. I'll get back to you soon.
                </div>
              )}

              <button
                type="submit"
                disabled={status === 'loading'}
                className="btn-primary w-full disabled:opacity-60"
              >
                {status === 'loading' ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Send Message
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
