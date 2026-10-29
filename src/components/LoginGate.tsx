import { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';

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
        setErr('The key was not recognised');
        setKey('');
        inputRef.current?.focus();
      } else {
        setErr('Something went wrong — please try again');
      }
    } catch {
      setErr('Connection lost — check your network');
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
    <div className="relative min-h-screen bg-[#08080a] text-[#f5f5f7] flex items-center justify-center p-6 overflow-hidden">
      {/* ═══ BACKDROP — 7 orbs, faster drifts ═══ */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 overflow-hidden"
        style={{ contain: 'strict' }}
      >
        <div className="absolute inset-0 bg-[#08080a]" />

        {/* 1 — violet, up-left — 10s */}
        <div
          className="absolute -top-[12%] -left-[8%] w-[540px] h-[540px] rounded-full
                     animate-[driftUpLeft_10s_ease-in-out_infinite]"
          style={{
            background:
              'radial-gradient(circle, rgba(124,92,255,0.9) 0%, rgba(124,92,255,0.35) 32%, rgba(124,92,255,0) 70%)',
            transform: 'translate3d(0,0,0)',
          }}
        />

        {/* 2 — pink, down-right — 12s */}
        <div
          className="absolute -bottom-[14%] -right-[10%] w-[540px] h-[540px] rounded-full
                     animate-[driftDownRight_12s_ease-in-out_infinite]"
          style={{
            background:
              'radial-gradient(circle, rgba(255,107,157,0.85) 0%, rgba(255,107,157,0.3) 32%, rgba(255,107,157,0) 70%)',
            transform: 'translate3d(0,0,0)',
          }}
        />

        {/* 3 — light purple, right — 9s */}
        <div
          className="absolute top-[28%] left-[44%] w-[460px] h-[460px] rounded-full
                     animate-[driftRight_9s_ease-in-out_infinite]"
          style={{
            background:
              'radial-gradient(circle, rgba(184,164,255,0.7) 0%, rgba(184,164,255,0.25) 32%, rgba(184,164,255,0) 70%)',
            transform: 'translate3d(0,0,0)',
          }}
        />

        {/* 4 — deep violet, left — 11s */}
        <div
          className="absolute bottom-[4%] left-[4%] w-[520px] h-[520px] rounded-full
                     animate-[driftLeft_11s_ease-in-out_infinite]"
          style={{
            background:
              'radial-gradient(circle, rgba(90,50,200,0.85) 0%, rgba(90,50,200,0.3) 32%, rgba(90,50,200,0) 70%)',
            transform: 'translate3d(0,0,0)',
          }}
        />

        {/* 5 — champagne gold, down — 13s */}
        <div
          className="absolute top-[2%] right-[6%] w-[500px] h-[500px] rounded-full
                     animate-[driftDown_13s_ease-in-out_infinite]"
          style={{
            background:
              'radial-gradient(circle, rgba(212,185,110,0.55) 0%, rgba(212,185,110,0.2) 32%, rgba(212,185,110,0) 70%)',
            transform: 'translate3d(0,0,0)',
          }}
        />

        {/* 6 — magenta, up — 7s */}
        <div
          className="absolute bottom-[12%] right-[16%] w-[440px] h-[440px] rounded-full
                     animate-[driftUp_7s_ease-in-out_infinite]"
          style={{
            background:
              'radial-gradient(circle, rgba(200,77,208,0.65) 0%, rgba(200,77,208,0.22) 32%, rgba(200,77,208,0) 70%)',
            transform: 'translate3d(0,0,0)',
          }}
        />

        {/* 7 — soft pink, diagonal — 14s */}
        <div
          className="absolute top-[38%] left-[6%] w-[380px] h-[380px] rounded-full
                     animate-[driftDiag_14s_ease-in-out_infinite]"
          style={{
            background:
              'radial-gradient(circle, rgba(255,141,179,0.55) 0%, rgba(255,141,179,0.18) 32%, rgba(255,141,179,0) 70%)',
            transform: 'translate3d(0,0,0)',
          }}
        />

        {/* Vignette */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(120% 90% at 50% 30%, transparent 25%, rgba(0,0,0,0.9) 100%)',
          }}
        />
      </div>

      {/* ═══ CARD ═══ */}
      <div className="relative w-full max-w-[400px] animate-[gateIn_600ms_cubic-bezier(0.16,1,0.3,1)_both]">
        {/* Ornament */}
        <div className="flex items-center justify-center gap-4 mb-10">
          <span className="h-px w-16 bg-gradient-to-r from-transparent to-[#d4b96e]/40" />
          <svg width="10" height="10" viewBox="0 0 10 10" className="text-[#d4b96e]">
            <path
              d="M5 0 L6.5 3.5 L10 5 L6.5 6.5 L5 10 L3.5 6.5 L0 5 L3.5 3.5 Z"
              fill="currentColor"
              opacity="0.7"
            />
          </svg>
          <span className="h-px w-16 bg-gradient-to-l from-transparent to-[#d4b96e]/40" />
        </div>

        {/* Orbital's + wordmark */}
        <div className="text-center mb-2">
          <p
            className="text-[8.5px] uppercase tracking-[0.5em] text-[#d4b96e]/70 mb-4"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: 600 }}
          >
            Orbital's
          </p>
          <h1
            className="text-[44px] leading-none text-transparent bg-clip-text bg-gradient-to-b from-white via-white/95 to-white/60"
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontWeight: 500,
              letterSpacing: '0.12em',
            }}
          >
            Chalachitra
          </h1>
        </div>

        <p
          className="text-center text-[10px] uppercase tracking-[0.4em] text-white/40 mt-5 mb-12"
          style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
        >
          Private Members Lounge
        </p>

        {/* Form */}
        <form onSubmit={submit} className="space-y-10">
          <div className="relative">
            <label
              htmlFor="access-key"
              className="block text-center text-[8.5px] uppercase tracking-[0.45em] text-[#d4b96e]/60 mb-4"
              style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: 600 }}
            >
              Access Key
            </label>
            <input
              ref={inputRef}
              id="access-key"
              type={showKey ? 'text' : 'password'}
              value={key}
              onChange={(e) => {
                setKey(e.target.value);
                if (err) setErr('');
              }}
              placeholder="• • • • • • • • • • • •"
              autoComplete="off"
              spellCheck={false}
              className="w-full bg-transparent border-0 border-b border-white/25
                         pb-3 text-center
                         text-[16px] text-white placeholder-white/20
                         font-mono tracking-[0.4em]
                         focus:outline-none focus:border-[#d4b96e]/70
                         transition-colors duration-300"
            />
            <button
              type="button"
              onClick={() => setShowKey((v) => !v)}
              className="absolute right-0 -bottom-6 text-[8px] uppercase tracking-[0.25em]
                         text-white/30 hover:text-[#d4b96e]/70 transition-colors cursor-pointer"
              aria-label={showKey ? 'Hide access key' : 'Show access key'}
            >
              {showKey ? 'Hide' : 'Reveal'}
            </button>
          </div>

          {err && (
            <p
              className="text-center text-[10px] tracking-[0.15em] text-[#ff6b9d]/90 italic -mt-6"
              style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
            >
              {err}
            </p>
          )}

          <button
            type="submit"
            disabled={busy || !key}
            className="group relative w-full py-4
                       bg-transparent
                       border border-[#d4b96e]/35
                       hover:border-[#d4b96e]/70 hover:bg-[#d4b96e]/5
                       active:scale-[0.99]
                       disabled:opacity-30 disabled:cursor-not-allowed
                       transition-all duration-300
                       flex items-center justify-center gap-3
                       cursor-pointer"
          >
            {busy ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#d4b96e]/70" />
                <span
                  className="text-[9px] uppercase tracking-[0.5em] text-[#d4b96e]/70"
                  style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: 600 }}
                >
                  Entering
                </span>
              </>
            ) : (
              <span
                className="text-[9px] uppercase tracking-[0.5em] text-[#d4b96e] group-hover:text-white transition-colors"
                style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: 600 }}
              >
                Enter the Lounge
              </span>
            )}
          </button>
        </form>

        {/* Footer — line only, no "Since" text */}
        <div className="mt-12 flex items-center justify-center gap-3">
          <span className="h-px w-8 bg-white/15" />
          <span className="h-px w-2 bg-[#d4b96e]/40" />
          <span className="h-px w-8 bg-white/15" />
        </div>
      </div>

      <style>{`
        @keyframes gateIn {
          from { opacity: 0; transform: translate3d(0, 16px, 0) scale(0.97); }
          to   { opacity: 1; transform: translate3d(0, 0, 0)    scale(1); }
        }

        @keyframes driftUpLeft {
          0%   { transform: translate3d(0, 0, 0) scale(1); }
          50%  { transform: translate3d(-90px, -120px, 0) scale(1.15); }
          100% { transform: translate3d(0, 0, 0) scale(1); }
        }
        @keyframes driftDownRight {
          0%   { transform: translate3d(0, 0, 0) scale(1); }
          50%  { transform: translate3d(110px, 130px, 0) scale(1.12); }
          100% { transform: translate3d(0, 0, 0) scale(1); }
        }
        @keyframes driftRight {
          0%   { transform: translate3d(0, 0, 0) scale(1); }
          50%  { transform: translate3d(160px, 0, 0) scale(1.2); }
          100% { transform: translate3d(0, 0, 0) scale(1); }
        }
        @keyframes driftLeft {
          0%   { transform: translate3d(0, 0, 0) scale(1); }
          50%  { transform: translate3d(-150px, 0, 0) scale(1.18); }
          100% { transform: translate3d(0, 0, 0) scale(1); }
        }
        @keyframes driftDown {
          0%   { transform: translate3d(0, 0, 0) scale(1); }
          50%  { transform: translate3d(0, 140px, 0) scale(1.14); }
          100% { transform: translate3d(0, 0, 0) scale(1); }
        }
        @keyframes driftUp {
          0%   { transform: translate3d(0, 0, 0) scale(1); }
          50%  { transform: translate3d(0, -140px, 0) scale(1.16); }
          100% { transform: translate3d(0, 0, 0) scale(1); }
        }
        @keyframes driftDiag {
          0%   { transform: translate3d(0, 0, 0) scale(1); }
          50%  { transform: translate3d(110px, -110px, 0) scale(1.2); }
          100% { transform: translate3d(0, 0, 0) scale(1); }
        }

        @media (prefers-reduced-motion: reduce) {
          [class*="animate-["] { animation: none !important; }
        }
      `}</style>
    </div>
  );
}