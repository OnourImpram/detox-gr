// Import grafı: köklerden (routes/*, router.tsx, routeTree.gen.ts, server/*, vite/app config) erişilmeyen src/** dosyalarını listeler.
// Kullanım: node scripts/erisilmeyen-dosyalar.mjs [--sil]   (--sil: erişilmeyen dosyaları git rm ile kaldırır)
import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import { join, dirname, resolve, extname } from "node:path";
import { execFileSync } from "node:child_process";

const ROOT = resolve(new URL("..", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1"));
const SRC = join(ROOT, "src");
const EXT = [".ts", ".tsx", ".mjs", ".js", ".json", ".css"];

function walk(dir, out = []) {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (EXT.includes(extname(p))) out.push(p);
  }
  return out;
}
const all = walk(SRC);
const allSet = new Set(all);

function resolveImport(from, spec) {
  let base;
  if (spec.startsWith("@/")) base = join(SRC, spec.slice(2));
  else if (spec.startsWith(".")) base = resolve(dirname(from), spec);
  else return null; // paket
  base = base.replace(/\?.*$/, ""); // ?url gibi
  const adaylar = [base, ...EXT.map((x) => base + x), ...EXT.map((x) => join(base, "index" + x))];
  return adaylar.find((c) => allSet.has(c)) ?? null;
}

const importRe = /(?:import|export)\s+(?:[^'"]*?\s+from\s+)?['"]([^'"]+)['"]|import\(\s*['"]([^'"]+)['"]\s*\)/g;
function deps(file) {
  const src = readFileSync(file, "utf8");
  const out = [];
  for (const m of src.matchAll(importRe)) {
    const spec = m[1] ?? m[2];
    const r = resolveImport(file, spec);
    if (r) out.push(r);
  }
  return out;
}

// Kökler: rota dosyaları, router, routeTree, styles, server/*, vite.config, app config
const roots = all.filter((f) => /[\\/]src[\\/]routes[\\/]/.test(f) || /[\\/]src[\\/](router|routeTree\.gen|styles)\.[a-z]+$/.test(f));
for (const extra of ["server", "vite.config.ts", "app.config.ts"]) {
  const p = join(ROOT, extra);
  if (existsSync(p)) (statSync(p).isDirectory() ? walk(p) : [p]).forEach((f) => roots.push(f));
}
const seen = new Set();
const stack = [...roots];
while (stack.length) {
  const f = stack.pop();
  if (seen.has(f)) continue;
  seen.add(f);
  for (const d of deps(f)) if (!seen.has(d)) stack.push(d);
}
const unreachable = all.filter((f) => !seen.has(f) && !/\.test\.(ts|tsx|mjs)$/.test(f) && !/\.d\.ts$/.test(f));
let bytes = 0;
for (const f of unreachable) bytes += statSync(f).size;
console.log(`src dosya: ${all.length} | erişilen: ${[...seen].filter((f) => allSet.has(f)).length} | erişilmeyen: ${unreachable.length} (${(bytes / 1024).toFixed(0)} KB)`);
for (const f of unreachable) console.log("  ", f.replace(ROOT, "").replace(/\\/g, "/"), `${(statSync(f).size / 1024).toFixed(1)} KB`);
if (process.argv.includes("--sil") && unreachable.length) {
  execFileSync("git", ["rm", "-q", ...unreachable], { cwd: ROOT, stdio: "inherit" });
  console.log("git rm:", unreachable.length, "dosya");
}
