// Converts a viam-generated Markdown GDD draft (see hi-games-viam's
// generate_gdd_template.py) into a gdd-tool ProjectModel scaffold.
//
// This is intentionally a conservative, best-effort scaffold builder, not a
// full GDD parser:
// - Each "## " section becomes one node on a single page. Node "kind" is
//   guessed from the heading text via keyword matching; when nothing
//   matches, the node falls back to 'entity' as the closest thing this
//   schema has to a generic container.
// - No relations are inferred between nodes. Markdown heading order does
//   not reliably encode "requires"/"affects"/etc. semantics, so fabricating
//   edges here would misrepresent design intent that was never actually
//   stated. Relations are left for the user to draw by hand after import.
// - An "Open Questions" section (as produced by generate_gdd_template.py's
//   --idea mode) is special-cased into a checklist instead of prose, since
//   its bullet points are literally a list of undecided items.
//
// Lives outside src/ on purpose: this is a build-time/offline conversion
// utility, not part of the shipped desktop app, and must never be reachable
// from src/main.tsx or bundled into the Tauri app.

import { createId, emptyProject } from '../../src/domain/project';
import { ProjectSchema, type GddNode, type NodeKind, type ProjectModel } from '../../src/domain/types';

const GRID_COLUMNS = 3;
const GRID_CELL_WIDTH = 280;
const GRID_CELL_HEIGHT = 220;
const GRID_ORIGIN_X = 40;
const GRID_ORIGIN_Y = 40;
const MAX_SUMMARY_LENGTH = 220;

type MarkdownSection = { heading: string; body: string[] };

// generate_gdd_template.py's prompt asks for English-only output, but in
// practice the LLM sometimes still answers in Turkish (see e.g. the real
// 2026-06-11 Expand It one-pager, which is entirely Turkish: "Açık
// Sorular", "Temel Mekanikler", "Platform & Motor", ...). Both languages'
// headings are matched here rather than trusting the prompt's stated
// language.
const TURKISH_FOLD: Record<string, string> = { ç: 'c', ğ: 'g', ı: 'i', ö: 'o', ş: 's', ü: 'u' };

function foldForMatching(text: string): string {
  return text.toLocaleLowerCase('tr').replace(/[çğıöşü]/g, (char) => TURKISH_FOLD[char] ?? char);
}

// Keyword lists checked in this order; first match wins.
const KIND_KEYWORDS: Array<[NodeKind, string[]]> = [
  ['mechanic', ['mechanic', 'mekanik', 'core loop', 'gameplay loop', 'core flow', 'rules', 'kural']],
  ['ui', ['ui/ux', 'ui', 'ux', 'interface', 'hud', 'menu', 'arayuz', 'arabirim']],
  ['level', ['level', 'content design', 'world design', 'encounter', 'bolum', 'seviye']],
  // NOTE: bare "hedef" (Turkish for "goal/target") is deliberately excluded
  // here - it also appears in unrelated headings like "Hedef Kitle" (target
  // audience), so it produced false positives during real-fixture testing.
  ['quest', ['quest', 'objective', 'edge case', 'gorev']],
  ['asset', ['asset', 'audio', 'music', 'art', 'vfx', 'sfx', 'technical requirement', 'platform', 'engine', 'ses', 'muzik', 'sanat', 'gorsel', 'motor']],
];

function classifyKind(heading: string): NodeKind {
  const normalized = foldForMatching(heading);
  for (const [kind, keywords] of KIND_KEYWORDS) {
    if (keywords.some((keyword) => normalized.includes(keyword))) return kind;
  }
  return 'entity';
}

function stripHeadingNumbering(heading: string): string {
  // "1. Vision" -> "Vision", "10. Appendix: Glossary" -> "Appendix: Glossary"
  return heading.replace(/^\d+[.)]\s*/, '').trim();
}

const OPEN_QUESTIONS_PHRASES = ['open question', 'acik soru'];

function isOpenQuestionsHeading(heading: string): boolean {
  const normalized = foldForMatching(heading).replace(/[^a-z\s]/g, '');
  return OPEN_QUESTIONS_PHRASES.some((phrase) => normalized.includes(phrase));
}

function extractBulletItems(lines: string[]): string[] {
  const items: string[] = [];
  for (const line of lines) {
    const match = line.match(/^\s*(?:[-*+]|\d+[.)])\s+(.*)$/);
    if (match && match[1].trim()) items.push(match[1].trim());
  }
  return items;
}

export function extractTitle(markdown: string): string | undefined {
  const match = markdown.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : undefined;
}

// Splits the document into "## " sections. Content before the first "## "
// (typically the H1 title line, plus any preamble) is discarded - there is
// nowhere meaningful to put free prose in the node/page/relation schema.
export function splitIntoSections(markdown: string): MarkdownSection[] {
  const lines = markdown.split(/\r?\n/);
  const sections: MarkdownSection[] = [];
  let current: MarkdownSection | undefined;

  for (const line of lines) {
    const headingMatch = line.match(/^##\s+(.+)$/);
    if (headingMatch) {
      current = { heading: stripHeadingNumbering(headingMatch[1].trim()), body: [] };
      sections.push(current);
      continue;
    }
    if (current) current.body.push(line);
  }

  return sections;
}

function buildNodeFromSection(section: MarkdownSection, pageId: string): GddNode {
  const bodyText = section.body.join('\n').trim();

  if (isOpenQuestionsHeading(section.heading)) {
    const items = extractBulletItems(section.body);
    return {
      id: createId('quest'),
      pageId,
      kind: 'quest',
      title: section.heading,
      summary: 'İçe aktarma sırasında bulunan çözülmemiş kararlar.',
      status: 'draft',
      tags: ['imported', 'open-questions'],
      designIntent: '',
      playerExperience: '',
      specification: '',
      testNotes: '',
      properties: {},
      checklist: items.map((text) => ({ id: createId('check'), text, done: false })),
    };
  }

  const firstLine = section.body.find((line) => line.trim().length > 0)?.trim() ?? '';
  const kind = classifyKind(section.heading);
  return {
    id: createId(kind),
    pageId,
    kind,
    title: section.heading,
    summary: firstLine.slice(0, MAX_SUMMARY_LENGTH),
    status: 'draft',
    tags: ['imported'],
    designIntent: '',
    playerExperience: '',
    specification: bodyText,
    testNotes: '',
    properties: {},
    checklist: [],
  };
}

export function convertMarkdownToProject(markdown: string, titleOverride?: string): ProjectModel {
  const project = emptyProject();
  const pageId = project.activePageId;
  const sections = splitIntoSections(markdown);
  const objects = sections.map((section) => buildNodeFromSection(section, pageId));

  const placements = objects.map((object, index) => ({
    nodeId: object.id,
    pageId,
    x: GRID_ORIGIN_X + (index % GRID_COLUMNS) * GRID_CELL_WIDTH,
    y: GRID_ORIGIN_Y + Math.floor(index / GRID_COLUMNS) * GRID_CELL_HEIGHT,
  }));

  const result: ProjectModel = {
    ...project,
    title: titleOverride ?? extractTitle(markdown) ?? project.title,
    objects,
    placements,
  };

  // Fail loudly here rather than writing a file that silently doesn't match
  // gdd-tool's current schema - this is the drift guard the format needs
  // since gdd-tool's schemaVersion has already moved 6 times.
  return ProjectSchema.parse(result);
}
