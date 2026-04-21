/**
 * Convert bead color xlsx to src/data/beadColors.json
 * Usage: node scripts/convertColors.mjs <path-to-xlsx>
 *
 * Expected xlsx columns: 色号, rgb, hex
 * rgb format: "255,128,0"
 * hex format: "#FF8000" or "FF8000"
 */

import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import * as XLSX from 'xlsx';

const __dirname = dirname(fileURLToPath(import.meta.url));

const xlsxPath = process.argv[2];
if (!xlsxPath) {
  console.error('Usage: node scripts/convertColors.mjs <path-to-xlsx>');
  process.exit(1);
}

const buffer = readFileSync(resolve(xlsxPath));
const workbook = XLSX.read(buffer, { type: 'buffer' });
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const rows = XLSX.utils.sheet_to_json(sheet);

const colors = rows.map((row) => {
  const code = String(row['色号'] ?? '').trim();
  const hexRaw = String(row['hex'] ?? '').trim();
  const rgbRaw = String(row['rgb'] ?? '').trim();

  const parts = rgbRaw.split(',').map((v) => parseInt(v.trim(), 10));
  const r = parts[0] ?? NaN;
  const g = parts[1] ?? NaN;
  const b = parts[2] ?? NaN;

  // Compute hex from rgb if missing or malformed
  const computedHex = `#${[r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')}`;
  const hex = hexRaw.match(/^#?[0-9a-fA-F]{6}$/)
    ? (hexRaw.startsWith('#') ? hexRaw : `#${hexRaw}`)
    : computedHex;

  return { code, r, g, b, hex };
}).filter((c) => c.code && !isNaN(c.r) && !isNaN(c.g) && !isNaN(c.b));

const outPath = resolve(__dirname, '../src/data/beadColors.json');
writeFileSync(outPath, JSON.stringify(colors, null, 2));
console.log(`Converted ${colors.length} colors → ${outPath}`);
