import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    // --- ADICIONE ESTA PARTE ABAIXO PARA CORRIGIR O ERRO DA HOSTINGER ---
    build: {
      chunkSizeWarningLimit: 2000, // Aumenta o limite para não dar erro de arquivo grande
      rollupOptions: {
        output: {
          manualChunks: {
            // Separa o Firebase em um arquivo próprio para não confundir o servidor
            'firebase-vendor': ['firebase/app', 'firebase/firestore'],
          },
        },
      },
    },
    // -------------------------------------------------------------------
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
