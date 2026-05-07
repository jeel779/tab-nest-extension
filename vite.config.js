import { copyFile, cp, mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const rootFiles = ["manifest.json", "background.js", "utils.js"];

function copyExtensionFiles() {
  return {
    name: "copy-extension-files",
    async closeBundle() {
      const outDir = resolve("dist");
      await mkdir(outDir, { recursive: true });
      await Promise.all(rootFiles.map(file => copyFile(resolve(file), resolve(outDir, file))));
      await cp(resolve("icons"), resolve(outDir, "icons"), { recursive: true });
    }
  };
}

export default defineConfig({
  plugins: [react(), copyExtensionFiles()],
  publicDir: false,
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        popup: resolve(__dirname, "popup.html"),
        save: resolve(__dirname, "save.html")
      }
    }
  }
});
