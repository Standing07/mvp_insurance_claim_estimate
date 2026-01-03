import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Using '.' instead of process.cwd() avoids type errors if @types/node is missing.
  const env = loadEnv(mode, '.', '');
  
  // Priority: 
  // 1. VITE_API_KEY (Standard Vite way)
  // 2. API_KEY (What we put in .env)
  // 3. process.env.API_KEY (System env var)
  const apiKey = env.VITE_API_KEY || env.API_KEY || process.env.API_KEY;

  return {
    // Vercel 預設使用根目錄，不需要 base: './'
    plugins: [react()],
    define: {
      // Inject the key globally so 'process.env.API_KEY' works in the browser
      // This string replacement happens at build time
      'process.env.API_KEY': JSON.stringify(apiKey),
    }
  };
});