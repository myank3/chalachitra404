import { useEffect, useRef, useState } from 'react';
import { Eye, EyeOff, Loader2, Lock } from 'lucide-react';

export function LoginGate({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<'checking' | 'in' | 'out'>('checking');
  const [pw, setPw] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch('/api/check')
      .then((r) => setState(r.ok ? 'in' : 'out'))
      .catch(() => setState('out'));
  }, []);

  useEffect(() => {
    if (state === 'out') inputRef.current?.focus();
  }, [state]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy || !pw) return;
    setBusy(true);
    setErr('');
    try {
      const r = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pw }),
      });
      if (r.ok) {
        setState('in');
      } else if (r.status === 401) {
        setErr('Incorrect password');
        setPw('');
        inputRef.current?.focus();
      } else {
        setErr('Something went wrong. Try again.');
      }
    } catch {
      setErr('Network error — check your connection.');
    } finally {
      setBusy(false);
    }
  }

  if (state === 'checking') {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-[#7c5cff] animate-spin" />
      </div>
    );
  }

  if (state === 'in') return <>{children}</>;

  return (
    <div className="relative min-h-screen bg-[#0a0a0b] text-[#f5f5f7] flex items-center justify-center p-4 overflow-hidden">
      {/* Ambient background */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0b0a14] via-[#08080a] to-[#050507]" />
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(60% 40% at 20% 8%, rgba(124,92,255,0.14) 0%, transparent 65%), ' +
              'radial-gradient(55% 40% at 85% 18%, rgba(255,107,157,0.10) 0%, transparent 65%)',
          }}
        />
      </div>

      {/* Card */}
      <div className="relative w-full max-w-sm animate-[gateIn_500ms_cubic-bezier(0.16,1,0.3,1)_both]">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#7c5cff]/15 border border-[#7c5cff]/40 mb-4 shadow-[0_0_40px_-8px_rgba(124,92,255,0.5)]">
            <Lock className="w-6 h-6 text-[#b8a4ff]" />
          </div>
          <h1 className="text-2xl font-semibold tracking-[-0.02em] bg-gradient-to-b from-white to-white/70 bg-clip-text text-transparent">
            Chalachitra
          </h1>
          <p className="text-xs text-white/45 mt-1.5">Private access</p>
        </div>

        {/* Form panel */}
        <form
          onSubmit={submit}
          className="rounded-2xl bg-white/[0.03] border border-white/[0.08] p-6 backdrop-blur-xl shadow-[0_20px_60px_-20px_rgba(0,0,0,0.8)] space-y-4"
        >
          <div>
            <label
              htmlFor="password"
              className="block text-[11px] font-medium uppercase tracking-[0.08em] text-white/45 mb-2"
            >
              Password
            </label>
            <div className="relative">
              <input
                ref={inputRef}
                id="password"
                type={showPw ? 'text' : 'password'}
                value={pw}
                onChange={(e) => {
                  setPw(e.target.value);
                  if (err) setErr('');
                }}
                placeholder="Enter password"
                autoComplete="current-password"
                spellCheck={false}
                className="w-full px-3.5 py-2.5 pr-10 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder-white/25 focus:outline-none focus:border-[#7c5cff]/60 focus:ring-2 focus:ring-[#7c5cff]/20 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                aria-label={showPw ? 'Hide password' : 'Show password'}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-white/40 hover:text-white/70 transition-colors cursor-pointer"
              >
                {showPw ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {err && (
              <p className="mt-2 text-[11px] text-red-400 animate-[shake_300ms_ease-out]">
                {err}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={busy || !pw}
            className="w-full py-2.5 rounded-xl bg-[#7c5cff] text-white text-sm font-semibold hover:bg-[#8f72ff] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-[0_8px_24px_-6px_rgba(124,92,255,0.6)] cursor-pointer"
          >
            {busy ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Unlocking…</span>
              </>
            ) : (
              <span>Unlock</span>
            )}
          </button>
        </form>

        <p className="text-center text-[10px] text-white/25 mt-6">
          Trailers only — full titles on official platforms
        </p>
      </div>

      <style>{`
        @keyframes gateIn {
          from { opacity: 0; transform: translateY(8px) scale(0.98); filter: blur(4px); }
          to   { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25%      { transform: translateX(-4px); }
          75%      { transform: translateX(4px); }
        }
        @media (prefers-reduced-motion: reduce) {
          [class*="animate-["] { animation: none !important; }
        }
      `}</style>
    </div>
  );
}