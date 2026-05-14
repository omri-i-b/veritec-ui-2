// Mirror pdfjs-dist's runtime asset directories into `public/pdfjs/`
// so they ship to `dist/pdfjs/` at unhashed paths. pdfjs's worker
// fetches `${WASM_URL}openjpeg.wasm` etc. at runtime; without these
// at predictable paths, the SPA fallback returns index.html and
// Chrome refuses to instantiate the WASM, leaving canvases blank.
//
// Idempotent: replaces stale dirs with fresh copies on each run.
// Used as `prebuild` + `predev`, also safe to invoke directly.

import { cpSync, existsSync, lstatSync, readdirSync, rmSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const APP_DIR = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const PKG = join(APP_DIR, "node_modules/pdfjs-dist");
const PUB = join(APP_DIR, "public/pdfjs");

if (!existsSync(PKG)) {
  console.error(`pdfjs-dist missing at ${PKG} — run npm install first`);
  process.exit(1);
}

const DIRS = ["wasm", "standard_fonts", "cmaps", "iccs"];

for (const dir of DIRS) {
  const src = join(PKG, dir);
  const dest = join(PUB, dir);
  if (!existsSync(src)) {
    console.error(`source missing: ${src}`);
    process.exit(1);
  }
  if (existsSync(dest)) {
    // Remove existing — handles symlinks, broken symlinks, and stale dirs.
    rmSync(dest, { recursive: true, force: true });
  }
  cpSync(src, dest, { recursive: true });
  const count = readdirSync(dest).filter((n) =>
    statSync(join(dest, n)).isFile(),
  ).length;
  console.log(`pdfjs sync: ${dir} → ${count} files`);
}
