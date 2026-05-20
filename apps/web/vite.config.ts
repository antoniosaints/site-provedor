import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],

  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: [
      'meganetma.com.br',
      'www.meganetma.com.br'
    ],
    proxy: {
      '/api': {
        target: 'https://sites-site-meganet.gcpwp3.easypanel.host',
        changeOrigin: true,
        secure: true
      },
      '/uploads': {
        target: 'https://sites-site-meganet.gcpwp3.easypanel.host',
        changeOrigin: true,
        secure: true
      }
    }
  },

  preview: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: [
      'meganetma.com.br',
      'www.meganetma.com.br'
    ]
  }
});