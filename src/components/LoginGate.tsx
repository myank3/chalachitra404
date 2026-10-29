import { useEffect, useRef, useState } from 'react';
import { Eye, EyeOff, KeyRound, Loader2 } from 'lucide-react';

/* Particle field — deterministic so no hydration mismatch if SSR ever added */
const PARTICLES = Array.from({ length: 22 }, (_, i) => {
  const seed = i * 137.5;
  return {
    left: `${(seed * 3.7) % 100}%`,
    delay: `${(seed * 0.13) % 18}s`,
    duration: `${14 + ((seed * 0.7) % 10)}s`,
    size: 1 + (i % 3),
    opacity: 0.15 + ((seed % 20) / 100),
  };
});

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
      <div className="min-h-screen bg-[#08080a] flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-[#7c5cff] animate-spin" />
      </div>
    );
  }

  if (state === 'in') return <>{children}</>;

  return (
    <div className="relative min-h-screen bg-[#08080a] text-[#f5f5f7] flex items-center justify-center p-4 overflow-hidden">
      {/* ═══════════════════════════════════════════
          PRIVATE LOUNGE — animated backdrop
          ═══════════════════════════════════════════ */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0b0a14] via-[#08080a] to-[#050507]" />

        {/* Rotating conic light ray — the "spotlight" */}
        <div
          className="absolute left-1/2 top-1/2 w-[1400px] h-[1400px] -translate-x-1/2 -translate-y-1/2 opacity-[0.13] animate-[spinSlow_80s_linear_infinite]"
          style={{
            background:
              'conic-gradient(from 0deg, transparent 0deg, rgba(124,92,255,0.9) 40deg, transparent 80deg, transparent 180deg, rgba(255,107,157,0.8) 220deg, transparent 260deg, transparent 360deg)',
            filter: 'blur(60px)',
          }}
        />

        {/* Orb 1 — purple, top-left */}
        <div
          className="absolute w-[560px] h-[560px] rounded-full opacity-50 animate-[drift1_24s_ease-in-out_infinite]"
          style={{
            top: '-14%',
            left: '-10%',
            background:
              'radial-gradient(circle, rgba(124,92,255,0.6) 0%, rgba(124,92,255,0) 70%)',
            filter: 'blur(70px)',
          }}
        />

        {/* Orb 2 — pink, bottom-right */}
        <div
          className="absolute w-[600px] h-[600px] rounded-full opacity-45 animate-[drift2_28s_ease-in-out_infinite]"
          style={{
            bottom: '-16%',
            right: '-12%',
            background:
              'radial-gradient(circle, rgba(255,107,157,0.55) 0%, rgba(255,107,157,0) 70%)',
            filter: 'blur(80px)',
          }}
        />

        {/* Orb 3 — teal, center-right */}
        <div
          className="absolute w-[420px] h-[420px] rounded-full opacity-30 animate-[drift3_32s_ease-in-out_infinite]"
          style={{
            top: '38%',
            left: '58%',
            background:
              'radial-gradient(circle, rgba(94,234,212,0.5) 0%, rgba(94,234,212,0) 70%)',
            filter: 'blur(90px)',
          }}
        />

        {/* Orb 4 — deep violet, bottom-left */}
        <div
          className="absolute w-[480px] h-[480px] rounded-full opacity-40 animate-[drift4_26s_ease-in-out_infinite]"
          style={{
            bottom: '8%',
            left: '8%',
            background:
              'radial-gradient(circle, rgba(90,50,200,0.55) 0%, rgba(90,50,200,0) 70%)',
            filter: 'blur(75px)',
          }}
        />

        {/* Orb 5 — magenta, top-right */}
        <div
          className="absolute w-[360px] h-[360px] rounded-full opacity-35 animate-[drift5_30s_ease-in-out_infinite]"
          style={{
            top: '10%',
            right: '6%',
            background:
              'radial-gradient(circle, rgba(214,58,140,0.5) 0%, rgba(214,58,140,0) 70%)',
            filter: 'blur(85px)',
          }}
        />

        {/* Floating particles */}
        {PARTICLES.map((p, i) => (
          <span
            key={i}
            className="absolute rounded-full bg-white animate-[floatUp_var(--dur)_linear_infinite]"
            style={
              {
                left: p.left,
                bottom: '-10px',
                width: `${p.size}px`,
                height: `${p.size}px`,
                opacity: p.opacity,
                animationDelay: p.delay,
                '--dur': p.duration,
              } as React.CSSProperties
            }
          />
        ))}

        {/* Vignette to keep edges calm */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(120% 90% at 50% 30%, transparent 35%, rgba(0,0,0,0.7) 100%)',
          }}
        />

        {/* Subtle grain */}
        <div
          className="absolute inset-0 opacity-[0.035] mix-blend-overlay"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.6'/></svg>\")",
          }}
        />
      </div>

      {/* ═══════════════════════════════════════════
          CARD
          ═══════════════════════════════════════════ */}
      <div className="relative w-full max-w-sm animate-[gateIn_700ms_cubic-bezier(0.16,1,0.3,1)_both]">
        {/* Brand block */}
        <div className="text-center mb-8">
          {/* Private lounge badge */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] mb-5 backdrop-blur-md">
            <span className="w-1 h-1 rounded-full bg-[#5eead4] animate-[pulseSoft_2s_ease-in-out_infinite]" />
            <span className="text-[9px] font-medium uppercase tracking-[0.18em] text-white/55">
              Private Lounge
            </span>
          </div>

          {/* Key icon */}
          <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#7c5cff]/15 border border-[#7c5cff]/40 mb-5 shadow-[0_0_60px_-8px_rgba(124,92,255,0.8)]">
            <KeyRound className="w-7 h-7 text-[#b8a4ff]" />
            <div className="absolute inset-0 rounded-2xl bg-[#7c5cff]/25 blur-2xl -z-10 animate-[pulseSoft_3.5s_ease-in-out_infinite]" />
          </div>

          <h1 className="text-[26px] font-semibold tracking-[-0.025em] bg-gradient-to-b from-white via-white/90 to-white/50 bg-clip-text text-transparent">
            Chalachitra
          </h1>
          <p className="text-[11px] text-white/40 mt-2 tracking-wide">
            Members only — enter your access key
          </p>
        </div>

        {/* Glass form card */}
        <form
          onSubmit={submit}
          className="relative rounded-2xl bg-white/[0.035] border border-white/[0.09] p-6 backdrop-blur-2xl shadow-[0_30px_80px_-20px_rgba(0,0,0,0.95),inset_0_1px_0_0_rgba(255,255,255,0.06)] space-y-4"
        >
          {/* Inner top sheen */}
          <div
            aria-hidden
            className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"
          />

          <div>
            <label
              htmlFor="access-key"
              className="block text-[10px] font-medium uppercase tracking-[0.15em] text-white/45 mb-2"
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
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-black/25 border border-white/[0.08] text-sm text-white placeholder-white/20 font-mono tracking-wider focus:outline-none focus:border-[#7c5cff]/60 focus:ring-2 focus:ring-[#7c5cff]/25 transition-all"
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
            className="w-full py-2.5 rounded-xl bg-gradient-to-b from-[#8f72ff] to-[#7c5cff] text-white text-sm font-semibold hover:from-[#9d84ff] hover:to-[#8a6cff] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-[0_8px_28px_-6px_rgba(124,92,255,0.8),inset_0_1px_0_0_rgba(255,255,255,0.25)] cursor-pointer"
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

        {/* Footer line */}
        <p className="text-center text-[10px] text-white/25 mt-6 tracking-wide">
          Restricted access · Chalachitra
        </p>
      </div>

      <style>{`
        @keyframes gateIn {
          from { opacity: 0; transform: translateY(14px) scale(0.97); filter: blur(8px); }
          to   { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25%      { transform: translateX(-4px); }
          75%      { transform: translateX(4px); }
        }
        @keyframes spinSlow {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to   { transform: translate(-50%, -50%) rotate(360deg); }
        }
        @keyframes drift1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33%      { transform: translate(70px, 50px) scale(1.15); }
          66%      { transform: translate(-40px, 90px) scale(0.9); }
        }
        @keyframes drift2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33%      { transform: translate(-80px, -60px) scale(1.12); }
          66%      { transform: translate(50px, -100px) scale(0.92); }
        }
        @keyframes drift3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50%      { transform: translate(-90px, 70px) scale(1.25); }
        }
        @keyframes drift4 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50%      { transform: translate(80px, -80px) scale(0.85); }
        }
        @keyframes drift5 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50%      { transform: translate(-60px, 90px) scale(1.18); }
        }
        @keyframes floatUp {
          0%   { transform: translateY(0) translateX(0); opacity: 0; }
          10%  { opacity: 1; }
          90%  { opacity: 1; }
          100% { transform: translateY(-105vh) translateX(20px); opacity: 0; }
        }
        @keyframes pulseSoft {
          0%, 100% { opacity: 0.4; }
          50%      { opacity: 0.85; }
        }
        @media (prefers-reduced-motion: reduce) {
          [class*="animate-["] { animation: none !important; }
        }
      `}</style>
    </div>
  );
}