import React, { useEffect, useState } from 'react';

declare global {
  interface Window {
    Telegram?: any;
  }
}

type TgUser = {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  language_code?: string;
};

export default function Home() {
  const [state, setState] = useState<{ phase: 'idle'|'loading'|'ok'|'error'; msg?: string; user?: TgUser }>({
    phase: 'idle'
  });

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (!tg) {
      setState({ phase: 'error', msg: 'Открой страницу внутри Telegram как WebApp (Mini App).' });
      return;
    }

    tg.ready();
    tg.expand();

    async function doAuth() {
      setState({ phase: 'loading' });
      try {
        const initData = tg.initData; // raw string
        const resp = await fetch('/api/auth/verify-init-data', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ initData }),
        });
        const data = await resp.json();
        if (!data.ok) throw new Error(data.error || 'Auth failed');
        setState({ phase: 'ok', user: data.user || undefined });
        tg.MainButton.setText('Продолжить');
        tg.MainButton.show();
      } catch (e: any) {
        setState({ phase: 'error', msg: e?.message || 'Auth failed' });
      }
    }

    doAuth();
  }, []);

  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', padding: 24 }}>
      <h1>Telegram WebApp Auth</h1>
      {state.phase === 'idle' && <p>Готовлюсь…</p>}
      {state.phase === 'loading' && <p>Проверяю подпись Telegram…</p>}
      {state.phase === 'ok' && (
        <>
          <p>Успешно! Пользователь: {state.user?.username ? `@${state.user?.username}` : (state.user?.first_name || 'неизвестно')}</p>
          <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', background: '#f6f6f6', padding: 12, borderRadius: 8 }}>
            {JSON.stringify(state.user, null, 2)}
          </pre>
        </>
      )}
      {state.phase === 'error' && (
        <p style={{ color: 'crimson' }}>Ошибка: {state.msg}</p>
      )}
    </main>
  );
}
