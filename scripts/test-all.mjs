import { readdirSync, mkdtempSync, rmSync, existsSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';

const root = resolve(import.meta.dirname, '..');
const tests = readdirSync(join(root, 'scripts')).filter(name => name.endsWith('.test.mjs')).map(name => join(root, 'scripts', name));
tests.push(...['shopify-cart.test.ts', 'shop-status.test.ts', 'dil-pazarlik.test.ts'].map(name => join(root, 'src/lib', name)));
// The retained platform suite includes assertions about proprietary prompt files not shipped here.
// Do not fabricate those files or report their tests as passing. Skip only those four named checks.
const externalDocsPresent = ['.grok/skills/og/SKILL.md', 'AGENTS.md'].every(path => existsSync(join(root, path)));
const externalDocTests = [
  'SKILL.md and AGENTS.md name the marker path and bound this script uses',
  'the sections that own the brand-task prohibition never affirm a wait',
  'SKILL.md tells the pass to self-check with the flag this CLI accepts',
  'every hand-over the og skill prints is one this script accepts',
];
const escape = text => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const args = ['--experimental-strip-types', '--test'];
if (!externalDocsPresent) {
  console.log('Excluding four named checks for external platform documentation not shipped in this repository.');
  args.push('--test-skip-pattern', `^(?:${externalDocTests.map(escape).join('|')})$`);
}
// Isolate cwd. Placeholder-card tests must not accidentally consume public/og.jpg from this shop.
const cwd = mkdtempSync(join(tmpdir(), 'detoks-tests-'));
try {
  const result = spawnSync(process.execPath, [...args, ...tests], { cwd, stdio: 'inherit', env: process.env });
  process.exitCode = result.status ?? 1;
} finally { rmSync(cwd, { recursive: true, force: true }); }
