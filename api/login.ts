import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createHmac, timingSafeEqual } from 'crypto';

const PASSWORD = process.env.SITE_PASSWORD ?? '';
const SECRET = process.env.AUTH_SECRET ?? '';
const DAYS = 30;

function sign(payload: string) {
  return createHmac('sha256', SECRET).update(payload).digest('hex');
}

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const password = typeof req.body?.password === 'string' ? req.body.password : '';

  const a = Buffer.from(password);
  const b = Buffer.from(PASSWORD);
  const ok =
    PASSWORD.length > 0 &&
    a.length === b.length &&
    timingSafeEqual(a, b);

  if (!ok) return res.status(401).json({ ok: false });

  const expiry = Date.now() + DAYS * 24 * 60 * 60 * 1000;
  const token = `${expiry}.${sign(String(expiry))}`;

  res.setHeader(
    'Set-Cookie',
    `auth=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${DAYS * 86400}`
  );
  return res.status(200).json({ ok: true });
}