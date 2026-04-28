import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  // Carrega as variáveis de ambiente (como a do Gemini e Firebase)
  const env = loadEnv(mode, process.cwd(), '');

  return {
    // Aqui estão os "motores" do seu design
    plugins: [
      react(), 
      tailwindcss()
    ],
    build: {
      chunkSizeWarningLimit: 2000,
      // Garante que o build vá para a pasta dist, que o server.js vai ler
      outDir: 'dist',
    },
    define: {
      // Passa a chave do Gemini para o Front-end
      'process.env.GEMINI_API_KEY': JSON.stringify(env.VITE_FIREBASE_API_KEY),
    },
    resolve: {
      alias: {
        // Isso permite que o código use "@" para encontrar arquivos facilmente
        '@': path.resolve(__dirname, './'),
      },
    },
    server: {
      // Configuração necessária para o AI Studio
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
