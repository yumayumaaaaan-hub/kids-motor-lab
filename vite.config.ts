import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => ({
  // GitHub Pages: /kids-motor-lab/  /  Cloudflare Pages: /
  base:
    process.env.CF_PAGES === '1'
      ? '/'
      : mode === 'production'
        ? '/kids-motor-lab/'
        : '/',
  plugins: [react()],
  server: {
    // 同じ Wi-Fi 内のスマホ・タブレットからアクセスできるようにする
    host: true,
    port: 5173,
    // 5173 が埋まっているとき 5174 に逃げない（URLが変わると保存データが別扱いになる）
    strictPort: true,
  },
  preview: {
    host: true,
    port: 4173,
  },
}));
