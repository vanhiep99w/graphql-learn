import { readdir, readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

export const root = fileURLToPath(new URL('../', import.meta.url));
export const digest = (text) => createHash('sha256').update(text).digest('hex');
export async function walk(dir) {
  const entries = await readdir(path.join(root, dir), { withFileTypes: true });
  const files = await Promise.all(entries.map((e) => e.isDirectory() ? walk(`${dir}/${e.name}`) : `${dir}/${e.name}`));
  return files.flat().sort();
}
export function fences(text) {
  return [...text.matchAll(/^(`{3,}|~{3,})([^\n]*)\n([\s\S]*?)^\1\s*$/gm)].map((m) => ({
    language: m[2].trim().split(/\s/)[0], meta: m[2], body: m[3], offset: m.index,
    line: text.slice(0, m.index).split('\n').length,
  }));
}
export async function inventory() {
  const files = (await walk('content/docs')).filter((p) => /\.mdx?$/.test(p));
  const audit = JSON.parse(await readFile(path.join(root, 'tests/fixtures/content-audit.json'), 'utf8'));
  const allowed = new Set(audit.filter((a) => a.kind === 'artifact').map((a) => `${a.path}:${a.sha256}`));
  const topLevel = (await readdir(root)).filter((p) => /\.mdx?$/.test(p));
  const assetNotes = (await walk('content/assets')).filter((p) => /\.mdx?$/.test(p));
  const counts = {}; const legacy = []; const diagrams = [];
  for (const file of [...files, ...topLevel, ...assetNotes]) {
    const text = await readFile(path.join(root, file), 'utf8');
    for (const fence of fences(text)) {
      counts[fence.language] = (counts[fence.language] ?? 0) + 1;
      if (fence.language === 'd2') diagrams.push({ file, ...fence });
      const key = `${file}:${digest(fence.body)}`;
      // Text diagrams require review; code, logs, payloads and known file listings do not.
      if (/mermaid/i.test(fence.language) || (
        ['', 'text', 'plaintext', 'ascii'].includes(fence.language) &&
        /[│─┌┐└┘├┤┬┴▼▲→←↑↓]|-->|<--|\+---/.test(fence.body) && !allowed.has(key)
      )) legacy.push(`${file}:${fence.line} (${fence.language || 'unlabelled'})`);
    }
    const outside = text.replace(/^(`{3,}|~{3,})[^\n]*\n[\s\S]*?^\1\s*$/gm, '');
    if (/<Mermaid\b|[│─┌┐└┘├┤┬┴▼▲]/i.test(outside)) legacy.push(`${file}: diagram outside fences`);
  }
  return { files: files.length, counts, legacy, diagrams };
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const result = await inventory();
  console.log(JSON.stringify({ pages: result.files, d2: result.diagrams.length,
    learning: Object.fromEntries(Object.entries(result.counts).filter(([k]) => /^(code-walkthrough|code-diff|terminal-session|protocol-exchange|span-waterfall)$/.test(k))),
    unconverted: result.legacy }, null, 2));
  if (result.legacy.length) process.exitCode = 1;
}
