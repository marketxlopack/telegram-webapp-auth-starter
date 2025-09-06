import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyInitData, allowCors } from '@/lib/telegram';

const BOT_TOKEN = process.env.BOT_TOKEN as string | undefined;
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    const origin = req.headers.origin as string | undefined;
    if (allowCors(origin, ALLOWED_ORIGINS)) {
      res.setHeader('Access-Control-Allow-Origin', origin || '*');
    }
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed' });
  if (!BOT_TOKEN) return res.status(500).json({ ok: false, error: 'Missing BOT_TOKEN' });

  const origin = req.headers.origin as string | undefined;
  if (allowCors(origin, ALLOWED_ORIGINS)) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
  }

  const { initData } = req.body as { initData?: string };
  if (!initData) return res.status(400).json({ ok: false, error: 'initData is required' });

  const result = verifyInitData(initData, BOT_TOKEN);

  if (!result.ok) {
    return res.status(401).json({ ok: false, error: result.reason || 'Invalid initData' });
  }

  // Extract user info if desired
  const params = new URLSearchParams(initData);
  const userStr = params.get('user');
  const user = userStr ? JSON.parse(userStr) : null;

  return res.status(200).json({ ok: true, user });
}
