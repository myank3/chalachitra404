import { useEffect, useRef, useState } from 'react';
import { Eye, EyeOff, KeyRound, Loader2 } from 'lucide-react';

export function LoginGate({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<'checking' | 'in' | 'out'>('checking');
  const [key, setKey] = useState('');
  const [showKey, setShowKey] = useState(false);
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
    if (busy || !key) return;
    setBusy(true);
    setErr('');
    try {
      const r = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: key }),
      });
      if (r.ok) {
        setState('in');
      } else if (r.status === 401) {
        setErr('Invalid access key');
        setKey('');
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
    <div className="relative min-h-screen bg-[#08080a] text-[#f5f5f7] flex items-center justify-center p-4 overflow-hidden">
      {/* Animated ambient background */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0b0a14] via-[#08080a] to-[#050507]" />

        {/* Orb 1 — purple */}
        <div
          className="absolute w-[520px] h-[520px] rounded-full opacity-50 animate-[drift1_22s_ease-in-out_infinite]"
          style={{
            top: '-10%',
            left: '-8%',
            background:
              'radial-gradient(circle, rgba(124,92,255,0.55) 0%, rgba(124,92,255,0) 70%)',
            filter: 'blur(60px)',
          }}
        />

        {/* Orb 2 — pink */}
        <div
          className="absolute w-[560px] h-[560px] rounded-full opacity-45 animate-[drift2_26s_ease-in-out_infinite]"
          style={{
            bottom: '-12%',
            right: '-10%',
            background:
              'radial-gradient(circle, rgba(255,107,157,0.5) 0%, rgba(255,107,157,0) 70%)',
            filter: 'blur(70px)',
          }}
        />

        {/* Orb 3 — teal accent */}
        <div
          className="absolute w-[380px] h-[380px] rounded-full opacity-35 animate-[drift3_30s_ease-in-out_infinite]"
          style={{
            top: '40%',
            left: '55%',
            background:
              'radial-gradient(circle, rgba(94,234,212,0.4) 0%, rgba(94,234,212,0) 70%)',
            filter: 'blur(80px)',
          }}
        />

        {/* Orb 4 — deep violet */}
        <div
          className="absolute w-[420px] h-[420px] rounded-full opacity-40 animate-[drift4_24s_ease-in-out_infinite]"
          style={{
            bottom: '10%',
            left: '10%',
            background:
              'radial-gradient(circle, rgba(90,50,200,0.5) 0%, rgba(90,50,200,0) 70%)',
            filter: 'blur(65px)',
          }}
        />

        {/* Dark vignette to keep edges calm */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(120% 90% at 50% 30%, transparent 40%, rgba(0,0,0,0.65) 100%)',
          }}
        />

        {/* Grain-ish subtle noise */}
        <div
          className="absolute inset-0 opacity-[0.04] mix-blend-overlay"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.6'/></svg>\")",
          }}
        />
      </div>

      {/* Card */}
      <div className="relative w-full max-w-sm animate-[gateIn_600ms_cubic-bezier(0.16,1,0.3,1)_both]">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#7c5cff]/15 border border-[#7c5cff]/40 mb-4 shadow-[0_0_50px_-8px_rgba(124,92,255,0.7)]">
            <KeyRound className="w-7 h-7 text-[#b8a4ff]" />
            <div className="absolute inset-0 rounded-2xl bg-[#7c5cff]/20 blur-xl -z-10 animate-[pulseSoft_3s_ease-in-out_infinite]" />
          </div>
          <h1 className="text-2xl font-semibold tracking-[-0.02em] bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">
            Chalachitra
          </h1>
          <p className="text-xs text-white/40 mt-1.5">Enter access key to continue</p>
        </div>

        {/* Form panel */}
        <form
          onSubmit={submit}
          className="rounded-2xl bg-white/[0.03] border border-white/[0.08] p-6 backdrop-blur-2xl shadow-[0_20px_60px_-20px_rgba(0,0,0,0.9)] space-y-4"
        >
          <div>
            <label
              htmlFor="access-key"
              className="block text-[11px] font-medium uppercase tracking-[0.1em] text-white/45 mb-2"
            >
              Access Key
            </label>
            <div className="relative">
              <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
              <input
                ref={inputRef}
                id="access-key"
                type={showKey ? 'text' : 'password'}
                value={key}
                onChange={(e) => {
                  setKey(e.target.value);
                  if (err) setErr('');
                }}
                placeholder="••••••••••••"
                autoComplete="off"
                spellCheck={false}
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder-white/25 font-mono tracking-wider focus:outline-none focus:border-[#7c5cff]/60 focus:ring-2 focus:ring-[#7c5cff]/20 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowKey((v) => !v)}
                aria-label={showKey ? 'Hide access key' : 'Show access key'}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-white/40 hover:text-white/70 transition-colors cursor-pointer"
              >
                {showKey ? (
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
            disabled={busy || !key}
            className="w-full py-2.5 rounded-xl bg-[#7c5cff] text-white text-sm font-semibold hover:bg-[#8f72ff] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-[0_8px_24px_-6px_rgba(124,92,255,0.7)] cursor-pointer"
          >
            {busy ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Verifying…</span>
              </>
            ) : (
              <span>Unlock</span>
            )}
          </button>
        </form>
      </div>

      <style>{`
        @keyframes gateIn {
          from { opacity: 0; transform: translateY(10px) scale(0.98); filter: blur(6px); }
          to   { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25%      { transform: translateX(-4px); }
          75%      { transform: translateX(4px); }
        }
        @keyframes drift1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33%      { transform: translate(60px, 40px) scale(1.15); }
          66%      { transform: translate(-30px, 80px) scale(0.9); }
        }
        @keyframes drift2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33%      { transform: translate(-70px, -50px) scale(1.1); }
          66%      { transform: translate(40px, -90px) scale(0.95); }
        }
        @keyframes drift3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50%      { transform: translate(-80px, 60px) scale(1.2); }
        }
        @keyframes drift4 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50%      { transform: translate(70px, -70px) scale(0.85); }
        }
        @keyframes pulseSoft {
          0%, 100% { opacity: 0.4; }
          50%      { opacity: 0.8; }
        }
        @media (prefers-reduced-motion: reduce) {
          [class*="animate-["] { animation: none !important; }
        }
      `}</style>
    </div>
  );
}