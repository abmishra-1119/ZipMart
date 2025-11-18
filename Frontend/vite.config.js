// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    outDir: "dist",
    rollupOptions: {
      output: {
        manualChunks: {
          // Manually splitting libraries into separate chunks
          vendor: ["react", "react-dom", "axios"],
          // You can also split based on custom criteria
          utilities: ["some-large-utility-lib"],
        },
      },
    },
  },
});
