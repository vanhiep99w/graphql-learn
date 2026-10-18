import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { compile } from '@mdx-js/mdx';
import { parse } from 'yaml';
import { remarkD2 } from '@vanhiep99w/docs-kit/d2';
import { remarkCodeWalkthrough, parseCodeWalkthroughDescriptor } from '@vanhiep99w/docs-kit/code-walkthrough';
import { remarkCodeDiff, parseCodeDiffDescriptor } from '@vanhiep99w/docs-kit/code-diff';
import { remarkTerminalSession, parseTerminalSession } from '@vanhiep99w/docs-kit/terminal-session';
import { remarkProtocolExchange, parseProtocolExchangeDescriptor } from '@vanhiep99w/docs-kit/protocol-exchange';
import { remarkSpanWaterfall, parseSpanWaterfallDescriptor } from '@vanhiep99w/docs-kit/span-waterfall';
import { root, walk, fences, digest, inventory } from '../scripts/content-inventory.mjs';

const read = (p) => readFile(path.join(root, p), 'utf8');
const baseline = JSON.parse(await read('tests/fixtures/page-contracts.json'));
const audit = JSON.parse(await read('tests/fixtures/content-audit.json'));
const learning = {
  'code-walkthrough': [parseCodeWalkthroughDescriptor, 'CodeWalkthrough'],
  'code-diff': [parseCodeDiffDescriptor, 'CodeDiff'],
  'terminal-session': [parseTerminalSession, 'TerminalSession'],
  'protocol-exchange': [parseProtocolExchangeDescriptor, 'ProtocolExchange'],
  'span-waterfall': [parseSpanWaterfallDescriptor, 'SpanWaterfall'],
};
const plugins = [[remarkD2, { assetsRoot: 'content/assets/d2', concurrency: 1, interactive: false,
  ...(process.env.D2_TEST_CACHE_DIR ? { cacheDir: process.env.D2_TEST_CACHE_DIR } : {}),
}],
  remarkCodeWalkthrough, remarkCodeDiff, remarkTerminalSession, remarkProtocolExchange, remarkSpanWaterfall];

function stringValues(value) {
  if (typeof value === 'string') return [value];
  if (value && typeof value === 'object') return Object.values(value).flatMap(stringValues);
  return [];
}

test('84 page identities, frontmatter, metadata order and existing URLs stay unchanged', async () => {
  assert.deepEqual((await walk('content/docs')).filter((p) => /\.(mdx?|json)$/.test(p)), baseline.map((p) => p.path).sort());
  for (const page of baseline) {
    const text = await read(page.path);
    if (page.content) { assert.equal(text, page.content, page.path); continue; }
    assert.equal(text.match(/^---\n[\s\S]*?\n---/)?.[0], page.frontmatter, page.path);
    const links = [...text.matchAll(/\]\(([^)]+)\)|\bhref="([^"]+)"/g)].map((m) => m[1] || m[2]);
    assert.deepEqual(links, page.links, `${page.path}: existing URLs/anchors`);
    assert.match(text, /^## Mục lục$/m, page.path);
  }
});

test('original code, logs, HTTP, payloads, SQL and configs survive exactly (or inside a learning descriptor)', async () => {
  for (const page of baseline.filter((p) => p.artifacts)) {
    const all = fences(await read(page.path));
    const candidates = all.filter((f) => !learning[f.language]).map((f) => f.body);
    for (const f of all.filter((f) => learning[f.language])) {
      const values = stringValues(parse(f.body));
      candidates.push(...values);
      // A former standalone JSON sample is now inside the illustrative terminal transcript.
      for (const value of values) if (value.startsWith('HTTP/')) candidates.push(value.slice(value.indexOf('{')));
    }
    const hashes = new Set(candidates.map((v) => digest(v.trimEnd())));
    for (const artifact of page.artifacts) assert.ok(hashes.has(artifact.sha256), `${page.path}: missing original ${artifact.language} artifact ${artifact.sha256}`);
  }
});

test('87 D2 diagrams accounted for; 37 deliberately retained text artifacts unchanged; no legacy diagrams', async () => {
  const result = await inventory();
  assert.equal(result.files, 84);
  assert.equal(result.diagrams.length, 87);
  assert.deepEqual(result.legacy, []);
  assert.equal(audit.filter((a) => a.kind === 'diagram').length, 87);
  assert.equal(audit.filter((a) => a.kind === 'artifact').length, 37);
  for (const item of audit) {
    const blocks = fences(await read(item.path));
    const block = blocks.find((f) => digest(f.body) === item.sha256);
    assert.ok(block, `${item.path}: audit entry drifted (${item.title ?? item.sha256})`);
    assert.equal(block.language, item.kind === 'diagram' ? 'd2' : 'text');
  }
});

test('all D2 and learning fences compile with installed 0.9.8 plugins and registered components', { timeout: 240_000 }, async (t) => {
  const pkg = JSON.parse(await read('node_modules/@vanhiep99w/docs-kit/package.json'));
  assert.equal(pkg.version, '0.9.8');
  const registry = await read('mdx-components.tsx');
  const css = await read('app/global.css');
  const config = await read('source.config.ts');
  for (const [language, [, component]] of Object.entries(learning)) {
    assert.match(registry, new RegExp(`\\b${component}\\b`));
    assert.ok(css.includes(`/styles/${language}.css`));
    assert.ok(config.includes(`/` + language + `'`));
  }
  const used = new Set();
  for (const file of (await walk('content/docs')).filter((p) => /\.mdx?$/.test(p))) {
    const all = fences(await read(file)).filter((f) => f.language === 'd2' || learning[f.language]);
    if (!all.length) continue;
    await t.test(file, async () => {
      for (const f of all) if (learning[f.language]) {
        await learning[f.language][0](f.body);
        used.add(f.language);
      }
      const output = String(await compile({ path: path.join(root, file), value: all.map((f) => '```' + f.meta + '\n' + f.body + '```').join('\n\n') }, { remarkPlugins: plugins }));
      for (const f of all) assert.ok(output.includes(f.language === 'd2' ? (/\binteractive\b/.test(f.meta) ? 'D2InteractiveDiagram' : 'D2Diagram') : learning[f.language][1]), `${file}: emitted component missing`);
      // Embedded icons must not leave a reading-time dependency on the catalog.
      if (all.some((f) => f.body.includes('icon:'))) {
        assert.match(output, /data:image\/svg\+xml/);
        assert.ok(!output.includes('https://icons.d2lang.com/'));
      }
    });
  }
  assert.deepEqual([...used].sort(), Object.keys(learning).sort());
});

test('vendored icon integrity, license and SVG safety', async () => {
  const asset = await read('content/assets/d2/java.svg');
  assert.equal(digest(asset), 'a6f65d8842fd38a48c7daaa646d3ee56ee22e6b09bf32316ee45f845c6ee63af');
  assert.doesNotMatch(asset, /<script|<foreignObject|\bon\w+=|(?:href|src)=["']https?:/i);
  assert.match(await read('content/assets/d2/LICENSE-devicon.txt'), /MIT|Permission is hereby granted/);
});
