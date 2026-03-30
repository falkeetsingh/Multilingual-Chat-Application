import { useMemo, useState } from 'react';

const languages = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Spanish' },
  { code: 'fr', label: 'French' },
  { code: 'de', label: 'German' },
  { code: 'hi', label: 'Hindi' },
  { code: 'ar', label: 'Arabic' },
];

export default function AuthPanel({ onSubmit, loading }) {
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [preferredLanguage, setPreferredLanguage] = useState('en');

  const title = useMemo(() => {
    return mode === 'login' ? 'Welcome Back' : 'Create Account';
  }, [mode]);

  const submit = (event) => {
    event.preventDefault();
    onSubmit({
      mode,
      name,
      email,
      password,
      preferredLanguage,
    });
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl items-center justify-center p-4 md:p-8">
      <section className="glass fade-in grid w-full overflow-hidden rounded-3xl border border-white/40 shadow-2xl md:grid-cols-5">
        <div className="hidden min-h-[560px] bg-[linear-gradient(160deg,#0d8b8b_0%,#146d6d_48%,#ef7e56_100%)] p-10 text-white md:col-span-2 md:flex md:flex-col md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.22em]">LinguaLive</p>
            <h1 className="mt-6 text-4xl font-semibold leading-tight">Realtime Chat That Speaks Your Language</h1>
            <p className="mt-6 text-sm text-white/85">
              Message instantly, auto-translate by user preference, and keep every conversation synced across web and mobile.
            </p>
          </div>
          <p className="text-xs text-white/75">Progressive Web App · MERN · Redis · Socket.io</p>
        </div>

        <div className="p-6 md:col-span-3 md:p-10">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-[#1e1a16]">{title}</h2>
            <button
              type="button"
              className="rounded-full bg-[#1e1a16] px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white"
              onClick={() => setMode((value) => (value === 'login' ? 'signup' : 'login'))}
            >
              {mode === 'login' ? 'Signup' : 'Login'}
            </button>
          </div>

          <form className="space-y-4" onSubmit={submit}>
            {mode === 'signup' && (
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-[#2a2622]">Name</span>
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="w-full rounded-xl border border-[#d9d1c6] bg-white/80 px-4 py-3 outline-none transition focus:border-[#0d8b8b]"
                  placeholder="Your name"
                  required
                />
              </label>
            )}

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-[#2a2622]">Email</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-xl border border-[#d9d1c6] bg-white/80 px-4 py-3 outline-none transition focus:border-[#0d8b8b]"
                placeholder="you@example.com"
                required
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-[#2a2622]">Password</span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-xl border border-[#d9d1c6] bg-white/80 px-4 py-3 outline-none transition focus:border-[#0d8b8b]"
                placeholder="Strong password"
                required
              />
            </label>

            {mode === 'signup' && (
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-[#2a2622]">Preferred Language</span>
                <select
                  value={preferredLanguage}
                  onChange={(event) => setPreferredLanguage(event.target.value)}
                  className="w-full rounded-xl border border-[#d9d1c6] bg-white/80 px-4 py-3 outline-none transition focus:border-[#0d8b8b]"
                >
                  {languages.map((language) => (
                    <option key={language.code} value={language.code}>
                      {language.label}
                    </option>
                  ))}
                </select>
              </label>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full rounded-xl bg-[#0d8b8b] px-4 py-3 text-sm font-semibold uppercase tracking-wider text-white transition hover:bg-[#0b7777] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Please wait...' : mode === 'login' ? 'Login' : 'Create account'}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
