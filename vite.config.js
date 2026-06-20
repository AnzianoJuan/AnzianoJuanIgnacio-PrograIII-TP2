// vite.config.js
import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        chart: resolve(__dirname, "chart.html"),
        exchange: resolve(__dirname, "exchange.html"), // ✅ singular, como tu archivo real
      },
    },
  },
});
