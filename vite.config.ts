import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  const NGROK_HOST = 'starlet-nursing-battery.ngrok-free.dev';

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      host: true,          // listen on 0.0.0.0 so ngrok can forward to you
      port: 3000,          // match your http://localhost:3000 URL
      strictPort: true,    // fail loudly if 3000 is taken

      // Allow the ngrok domain (Vite 5.4+ blocks unknown Host headers by default)
      allowedHosts: [
        NGROK_HOST,
        '.ngrok-free.dev',      // wildcard for rotating subdomains
        '.ngrok-free.app',
        '.ngrok.io',
        'localhost',
      ],

      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR === 'true'
        ? false
        : {
            // Route HMR websocket through the ngrok tunnel when accessed remotely
            host: NGROK_HOST,
            protocol: 'wss',
            clientPort: 443,
          },

      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});