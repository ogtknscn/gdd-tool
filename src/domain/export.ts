import type { Language } from './i18n';
import { nodeLabel, type GddNode, type ProjectModel } from './types';

const safeName = (title: string) => title.trim().replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-|-$/g, '') || 'gdd-project';

const download = (content: BlobPart, type: string, name: string) => {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
};

// Field labels and enum values (kind/status/edge kind) below are deliberately
// kept in English regardless of the app's Turkish UI: this Markdown is the
// bridge back into hi-games-viam's RAG pipeline (English-Only Law), while
// user-authored free text (titles, summaries, long fields) stays whatever
// language the author typed it in, exactly like generate_gdd_template.py's
// own output does.
const longFieldLabels: Array<{ key: keyof Pick<GddNode, 'designIntent' | 'playerExperience' | 'specification' | 'testNotes'>; label: string }> = [
  { key: 'designIntent', label: 'Design Intent' },
  { key: 'playerExperience', label: 'Player Experience' },
  { key: 'specification', label: 'Specification' },
  { key: 'testNotes', label: 'Test Notes' },
];

function pageMarkdown(project: ProjectModel, page: ProjectModel['pages'][number]): string {
  const nodes = project.objects.filter((node) => node.pageId === page.id);
  const edges = project.relations.filter((edge) => edge.pageId === page.id);

  const nodeSections = nodes.map((node) => {
    const summaryLine = node.summary ? `- Summary: ${node.summary}\n` : '';
    const tagsLine = node.tags.length ? `- Tags: ${node.tags.join(', ')}\n` : '';
    const longLines = longFieldLabels
      .filter(({ key }) => node[key])
      .map(({ key, label }) => `- ${label}: ${node[key]}\n`)
      .join('');
    const checklistLine = node.checklist.length
      ? `- Checklist:\n${node.checklist.map((item) => `  - [${item.done ? 'x' : ' '}] ${item.text}`).join('\n')}\n`
      : '';
    return `### ${node.title}\n- Kind: ${node.kind}\n- Status: ${node.status}\n${summaryLine}${tagsLine}${longLines}${checklistLine}`;
  });

  const edgeLines = edges.map((edge) => {
    const sourceTitle = project.objects.find((node) => node.id === edge.source)?.title ?? edge.source;
    const targetTitle = project.objects.find((node) => node.id === edge.target)?.title ?? edge.target;
    return `- ${sourceTitle} -> ${targetTitle}: ${edge.customLabel || edge.kind}`;
  });

  return `## ${page.title}\n\n${nodeSections.join('\n')}\n### Connections\n${edgeLines.join('\n') || '- None'}\n`;
}

export const projectMarkdown = (project: ProjectModel) =>
  `# ${project.title}\n\n${project.pages.map((page) => pageMarkdown(project, page)).join('\n')}`;

export const projectSvg = (project: ProjectModel, language: Language) => {
  const page = project.pages.find((item) => item.id === project.activePageId)!;
  const nodes = project.objects.filter((node) => node.pageId === page.id);
  const position = (id: string) => project.placements.find((item) => item.nodeId === id && item.pageId === page.id) ?? { x: 0, y: 0 };
  const esc = (value: string) =>
    value.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]!));

  const minX = Math.min(0, ...nodes.map((node) => position(node.id).x)) - 40;
  const minY = Math.min(0, ...nodes.map((node) => position(node.id).y)) - 40;
  const maxX = Math.max(800, ...nodes.map((node) => position(node.id).x + 210)) + 40;
  const maxY = Math.max(500, ...nodes.map((node) => position(node.id).y + 110)) + 40;

  const edgePaths = project.relations
    .filter((edge) => edge.pageId === page.id)
    .map((edge) => {
      const source = position(edge.source);
      const target = position(edge.target);
      return `<path d="M ${source.x + 210} ${source.y + 55} L ${target.x} ${target.y + 55}" stroke="#9aa8c5" stroke-width="2" fill="none"/>`;
    })
    .join('');

  const nodeShapes = nodes
    .map((node) => {
      const point = position(node.id);
      return `<g><rect x="${point.x}" y="${point.y}" width="210" height="110" rx="10" fill="#20293a" stroke="#8b74ff"/><text x="${point.x + 14}" y="${point.y + 34}" fill="#fff" font-family="Arial" font-size="15">${esc(node.title)}</text><text x="${point.x + 14}" y="${point.y + 60}" fill="#b9c5df" font-family="Arial" font-size="11">${esc(nodeLabel(node.kind, language))}</text></g>`;
    })
    .join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${maxX - minX}" height="${maxY - minY}" viewBox="${minX} ${minY} ${maxX - minX} ${maxY - minY}"><rect x="${minX}" y="${minY}" width="${maxX - minX}" height="${maxY - minY}" fill="#111827"/>${edgePaths}${nodeShapes}</svg>`;
};

export const downloadMarkdown = (project: ProjectModel) =>
  download(projectMarkdown(project), 'text/markdown;charset=utf-8', `${safeName(project.title)}.md`);

export const downloadSvg = (project: ProjectModel, language: Language) =>
  download(projectSvg(project, language), 'image/svg+xml;charset=utf-8', `${safeName(project.title)}.svg`);

export const downloadPng = async (project: ProjectModel, language: Language) => {
  const svg = projectSvg(project, language);
  const image = new Image();
  const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
  image.src = url;
  await image.decode();
  const canvas = document.createElement('canvas');
  canvas.width = image.width;
  canvas.height = image.height;
  canvas.getContext('2d')?.drawImage(image, 0, 0);
  URL.revokeObjectURL(url);
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
  if (blob) download(blob, 'image/png', `${safeName(project.title)}.png`);
};
