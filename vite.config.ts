import path from "path";
import { fileURLToPath } from "url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  // Set VITE_BASE_URL=/repo-name/ when deploying to GitHub Pages subdirectory
  const base = env.VITE_BASE_URL || "/";

  return {
    base,
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
      },
    },
    build: {
      outDir: "dist",
      sourcemap: false,
      minify: "esbuild",
      cssMinify: true,
      chunkSizeWarningLimit: 600,
      rollupOptions: {
        output: {
          manualChunks: {
            "vendor-react":  ["react", "react-dom", "react-router-dom"],
            "vendor-ui":     ["lucide-react", "framer-motion"],
            "vendor-state":  ["zustand"],
            "vendor-charts": ["recharts"],
            "vendor-forms":  ["react-hook-form", "react-hot-toast", "react-dropzone"],
            "vendor-utils":  ["clsx", "tailwind-merge", "date-fns"],
          },
          chunkFileNames:  "assets/[name]-[hash].js",
          entryFileNames:  "assets/[name]-[hash].js",
          assetFileNames:  "assets/[name]-[hash].[ext]",
        },
      },
    },
    preview: {
      port: 4173,
      strictPort: true,
    },
  };
});
