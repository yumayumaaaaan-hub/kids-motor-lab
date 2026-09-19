/** 本番だけ PWA 用サービスワーカーを登録する。保存データは触らない */
export function registerServiceWorker(): void {
  if (!import.meta.env.PROD) {
    return;
  }
  if (!('serviceWorker' in navigator)) {
    return;
  }

  window.addEventListener('load', () => {
    const workerUrl = `${import.meta.env.BASE_URL}sw.js`;
    navigator.serviceWorker
      .register(workerUrl, { scope: import.meta.env.BASE_URL })
      .catch(() => {
        // 登録できなくても、いつもどおりブラウザで遊べる
      });
  });
}
