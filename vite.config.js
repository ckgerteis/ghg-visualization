import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  base: "/ghg-visualization/",
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        references: resolve(__dirname, "references.html"),
        maritime: resolve(__dirname, "maritime-corridor.html"),
      },
    },
  },
});
