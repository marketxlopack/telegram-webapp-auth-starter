import React, { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    TelegramLoginWidget?: any;
  }
}

const BOT_USERNAME = process.env.NEXT_PUBLIC_BOT_USERNAME || '';

export default function LoginWidgetPage() {
  const ref = useRef<HTMLDivElement | null>(null);
  const [err, setErr] = useState<string>('');

  useEffect(() => {
    if (!ref.current) return;

    if (!BOT_USERNAME) {
      setErr('Настройте NEXT_PUBLIC_BOT_USERNAME в .env.local для теста логина через виджет.');
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-widget.js?22';
    script.async = true;
    script.setAttribute('data-telegram-login', BOT_USERNAME);
    script.setAttribute('data-size', 'large');
    script.setAttribute('data-userpic', 'false');
    script.setAttribute('data-onauth', 'onTelegramAuth(user)');
    script.setAttribute('data-request-access', 'write');
    script.onload = () => {
      (window as any).onTelegramAuth = async (user: any) => {
        // This path is for classic login; for WebApp use index page flow.
        alert('Здравствуйте, ' + (user.username || user.first_name));
      };
    };

    ref.current.appendChild(script);
  }, []);

  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', padding: 24 }}>
      <h1>Telegram Login Widget (опционально)</h1>
      {err ? <p style={{ color: 'crimson' }}>{err}</p> : <div ref={ref} />}
    </main>
  );
}
