// CLI: convert a viam-generated Markdown GDD draft into a gdd-tool
// .gdd.json scaffold, so it opens as a starting canvas instead of plain
// text.
//
// Usage:
//   npm run import:markdown -- <input.md> [--out <output.gdd.json>] [--title "Custom title"]
//
// This is a one-way, one-shot scaffold: kind classification is a heuristic
// (see scripts/lib/markdown-to-gdd.ts) and no relations are inferred. Open
// the result in gdd-tool, run "Kontrol" (project validation), and re-check
// node kinds and connections by hand before treating it as real design
// content.

import { readFileSync, writeFileSync } from 'node:fs';
import { basename, dirname, extname, join, resolve } from 'node:path';
import { NODE_LABELS } from '../src/domain/types';
import { convertMarkdownToProject } from './lib/markdown-to-gdd';

function parseArgs(argv: string[]) {
  const [input, ...rest] = argv;
  if (!input) {
    console.error('Kullanım: npm run import:markdown -- <input.md> [--out <output.gdd.json>] [--title "Başlık"]');
    process.exit(1);
  }

  let out: string | undefined;
  let title: string | undefined;
  for (let i = 0; i < rest.length; i += 1) {
    if (rest[i] === '--out') {
      i += 1;
      out = rest[i];
    } else if (rest[i] === '--title') {
      i += 1;
      title = rest[i];
    }
  }
  return { input, out, title };
}

function defaultOutputPath(inputPath: string): string {
  const base = basename(inputPath, extname(inputPath));
  return join(dirname(inputPath), `${base}.gdd.json`);
}

function main() {
  const { input, out, title } = parseArgs(process.argv.slice(2));
  const inputPath = resolve(input);
  const outputPath = resolve(out ?? defaultOutputPath(inputPath));

  const markdown = readFileSync(inputPath, 'utf-8');
  const project = convertMarkdownToProject(markdown, title);

  writeFileSync(outputPath, JSON.stringify(project, null, 2), 'utf-8');

  const counts = new Map<string, number>();
  for (const node of project.objects) counts.set(node.kind, (counts.get(node.kind) ?? 0) + 1);

  console.log(`İçe aktarıldı: ${project.objects.length} öğe -> ${outputPath}`);
  for (const [kind, count] of counts) {
    console.log(`  - ${NODE_LABELS[kind as keyof typeof NODE_LABELS]}: ${count}`);
  }
  console.log('Not: kind ataması sezgiseldir, bağlantı yoktur. gdd-tool\'da açıp "Kontrol" ile gözden geçirin.');
}

main();
