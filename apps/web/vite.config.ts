import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  build: {
    sourcemap: "hidden",
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return;
          if (id.includes("@heroui")) return "heroui";
          if (id.includes("@tanstack") || id.includes("@trpc")) return "router-data";
          // React queda en el chunk por defecto para evitar ciclos vendor ↔ react.
        },
      },
    },
  },
  server: {
    port: 5173,
    proxy: {
      "/trpc": { target: "http://localhost:3000", changeOrigin: true },
      "/api": { target: "http://localhost:3000", changeOrigin: true },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
