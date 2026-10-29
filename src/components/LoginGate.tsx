import { useEffect, useState } from 'react';

export function LoginGate({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<'checking' | 'in' | 'out'>('checking');
  const [pw, setPw] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch('/api/check')
      .then((r) => setState(r.ok ? 'in' : 'out'))
      .catch(() => setState('out'));
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr('');
    try {
      const r = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pw }),
      });
      if (r.ok) setState('in');
      else setErr('Wrong password');
    } catch {
      setErr('Network error');
    } finally {
      setBusy(false);
    }
  }

  if (state === 'checking') return <div className="min-h-screen bg-[#0a0a0b]" />;
  if (state === 'in') return <>{children}</>;

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white flex items-center justify-center p-4">
      <form onSubmit={submit} className="w-full max-w-sm space-y-3">
        <h1 className="text-xl font-semibold">Chalachitra</h1>
        <input
          type="password"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          placeholder="Password"
          autoFocus
          className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 focus:outline-none focus:border-white/30"
        />
        {err && <p className="text-xs text-red-400">{err}</p>}
        <button
          type="submit"
          disabled={busy || !pw}
          className="w-full py-2 rounded-lg bg-[#7c5cff] text-white text-sm font-semibold disabled:opacity-50"
        >
          {busy ? 'Checking…' : 'Enter'}
        </button>
      </form>
    </div>
  );
}