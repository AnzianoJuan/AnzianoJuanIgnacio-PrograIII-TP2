import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
      "@pages": resolve(__dirname, "src/pages"),
    },
  },
  build: {
    rolldownOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        chart: resolve(__dirname, "src/pages/chart/index.html"),
        exchange: resolve(__dirname, "src/pages/exchange/index.html"),
      },
    },
  },
});