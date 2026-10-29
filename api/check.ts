import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createHmac, timingSafeEqual } from 'crypto';

const SECRET = process.env.AUTH_SECRET ?? '';

function sign(payload: string) {
  return createHmac('sha256', SECRET).update(payload).digest('hex');
}

export default function handler(req: VercelRequest, res: VercelResponse) {
  const cookie = req.headers.cookie ?? '';
  const match = cookie.match(/(?:^|;\s*)auth=([^;]+)/);
  if (!match) return res.status(401).json({ ok: false });

  const [expiryStr, sig] = match[1].split('.');
  const expiry = Number(expiryStr);
  if (!expiry || expiry < Date.now()) return res.status(401).json({ ok: false });

  const expected = sign(expiryStr);
  const a = Buffer.from(sig ?? '');
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return res.status(401).json({ ok: false });
  }
  return res.status(200).json({ ok: true });
}