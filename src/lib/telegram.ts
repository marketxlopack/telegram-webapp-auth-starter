import crypto from 'crypto';

/**
 * Verify Telegram WebApp initData per https://core.telegram.org/bots/webapps#validating-data-received-via-the-web-app
 */
export function verifyInitData(initData: string, botToken: string): { ok: boolean; reason?: string } {
  try {
    const urlParams = new URLSearchParams(initData);
    const hash = urlParams.get('hash');
    if (!hash) return { ok: false, reason: 'Missing hash' };

    // Build data-check-string
    const kvPairs: string[] = [];
    for (const [key, value] of urlParams.entries()) {
      if (key === 'hash') continue;
      kvPairs.push(`${key}=${value}`);
    }
    kvPairs.sort();
    const dataCheckString = kvPairs.join('\n');

    // Secret key = HMAC_SHA256("WebAppData", SHA256(bot_token))
    const secret = crypto.createHash('sha256').update(botToken).digest();
    const hmac = crypto.createHmac('sha256', secret).update(dataCheckString).digest('hex');

    if (hmac !== hash) return { ok: false, reason: 'Hash mismatch' };

    // Optional: check auth_date not too old (<= 24h)
    const authDateStr = urlParams.get('auth_date');
    if (authDateStr) {
      const authDate = Number(authDateStr);
      const now = Math.floor(Date.now() / 1000);
      if (Number.isFinite(authDate) && now - authDate > 24 * 60 * 60) {
        return { ok: false, reason: 'auth_date is too old' };
      }
    }

    return { ok: true };
  } catch (e: any) {
    return { ok: false, reason: e?.message || 'Unknown error' };
  }
}

/**
 * Minimal CORS helper
 */
export function allowCors(origin: string | undefined, allowedOrigins: string[]): boolean {
  if (!origin) return true;
  if (allowedOrigins.includes('*')) return true;
  return allowedOrigins.includes(origin);
}
