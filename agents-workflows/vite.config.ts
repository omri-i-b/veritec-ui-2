import path from "node:path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// pdfjs assets (wasm/fonts/cmaps/iccs) are mirrored from
// `node_modules/pdfjs-dist/*` into `public/pdfjs/*` by
// `scripts/sync-pdfjs-assets.mjs` (run as predev/prebuild). Vite serves
// public/ verbatim in dev and copies it into dist/ at build time, so the
// worker's runtime fetches resolve at unhashed paths in both environments.

// Set `VERITEC_BASE` at build time when deploying under a subpath, e.g.
//   VERITEC_BASE=/veritec-agents/ npm run build
// for hosting at https://omrib.dev/veritec-agents/. Defaults to "/" for
// local dev and subdomain deployments.
const base = process.env.VERITEC_BASE ?? "/"

export default defineConfig({
  base,
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 3000,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom"],
          pdf: ["pdfjs-dist"],
          virtuoso: ["react-virtuoso"],
          phosphor: ["@phosphor-icons/react"],
          radix: ["radix-ui"],
        },
      },
    },
  },
})
