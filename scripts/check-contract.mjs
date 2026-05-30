#!/usr/bin/env node
/**
 * Self-contained contract drift check (X1) — runs in this repo's CI with no deps.
 *
 * The files below are VERBATIM copies of the canonical contract, synced from
 * <repo-root>/contract/ by `node ../contract/sync.mjs`. This guard fingerprints
 * them and compares to the committed baseline `src/contract/contract.lock`, so an
 * accidental local edit (drift) fails CI instead of silently diverging.
 *
 *   node scripts/check-contract.mjs            # verify (exit 1 on drift)
 *   node scripts/check-contract.mjs --write    # re-baseline after a genuine re-sync
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const LOCK = join(repoRoot, 'src/contract/contract.lock');
// Vendored canonical copies this repo guards (relative to repoRoot).
const FILES = [
  'src/contract/waqty_contract.ts',
  'src/contract/platform_finance.ts',
];

const norm = (s) => s.replace(/\r\n/g, '\n');
function digest(rel) {
  const bytes = Buffer.from(norm(readFileSync(join(repoRoot, rel), 'utf8')), 'utf8');
  let h = 0x811c9dc5;
  for (const b of bytes) { h = (h ^ b) >>> 0; h = Math.imul(h, 0x01000193) >>> 0; }
  return `${bytes.length}-${h.toString(16).padStart(8, '0')}`;
}

const current = FILES.map((f) => `${digest(f)}  ${f}`).join('\n') + '\n';

if (process.argv.includes('--write')) {
  writeFileSync(LOCK, current, 'utf8');
  process.stdout.write('contract.lock baselined:\n' + current);
  process.exit(0);
}
if (!existsSync(LOCK)) {
  console.error('contract.lock missing. Baseline with: node scripts/check-contract.mjs --write');
  process.exit(2);
}
if (norm(readFileSync(LOCK, 'utf8')) !== norm(current)) {
  console.error('CONTRACT DRIFT DETECTED in a vendored canonical copy.\n');
  console.error('current:\n' + current);
  console.error('The vendored contract must stay a verbatim copy of <repo-root>/contract/.');
  console.error('Re-sync (node ../contract/sync.mjs) then re-baseline (--write).');
  process.exit(1);
}
process.stdout.write('Contract OK:\n' + current);
