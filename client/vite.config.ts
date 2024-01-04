import path from "path";

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [svgr(), react()],
  resolve: {
    alias: {
      "@pages": path.resolve(__dirname, "./src/pages"),
      "@routes": path.resolve(__dirname, "./src/routes"),
      "@assets": path.resolve(__dirname, "./src/assets"),
      "@components": path.resolve(__dirname, "./src/components"),
      "@layouts": path.resolve(__dirname, "./src/layouts"),
      "@store": path.resolve(__dirname, "./src/store"),
    }
  }
})
