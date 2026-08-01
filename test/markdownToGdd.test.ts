import { describe, expect, it } from 'vitest';
import { convertMarkdownToProject, extractTitle, splitIntoSections } from '../scripts/lib/markdown-to-gdd';

const ONE_PAGER = `# [Game Name] — Concept

## Game in One Sentence
A puzzle game about rotating light beams.

## Core Mechanics
- Rotate mirrors to redirect beams
- Match beam color to target
- Limited moves per level

## UI/UX
The HUD shows remaining moves and the current target color.

## Platform & Engine
Unity, mobile-first.
`;

const IDEA_WITH_OPEN_QUESTIONS = `# Sample Idea

## Vision
A relaxing idle game about tending a garden.

## Open Questions
- What is the core monetization loop?
- Should there be a multiplayer mode?
`;

// generate_gdd_template.py is prompted to answer in English, but real
// output (e.g. the 2026-06-11 Expand It one-pager) can still come back
// entirely in Turkish. The importer has to handle both.
const TURKISH_ONE_PAGER = `# Expand It — Konsept

## Tek Cumlede Oyun
Fizik tabanlı bir incremental oyun.

## Temel Mekanikler (3-5 madde)
1. Mermi Üretimi ve Fırlatma
2. Kalkan Yok Etme

## Platform & Motor
* Platform: Web
* Oyun Motoru: Unity

## Açık Sorular

* Seviye Geçişi nasıl sunulacak?
* Monetizasyon Stratejisi ne olacak?
`;

describe('extractTitle', () => {
  it('reads the first H1 heading', () => {
    expect(extractTitle(ONE_PAGER)).toBe('[Game Name] — Concept');
  });

  it('returns undefined when there is no H1', () => {
    expect(extractTitle('## Just a section\nBody')).toBeUndefined();
  });
});

describe('splitIntoSections', () => {
  it('splits on H2 headings and strips numbering', () => {
    const sections = splitIntoSections('# Title\n\n## 1. Vision\nBody one\n\n## 2. Gameplay Loop\nBody two\n');
    expect(sections.map((section) => section.heading)).toEqual(['Vision', 'Gameplay Loop']);
    expect(sections[0].body.join('\n')).toContain('Body one');
  });

  it('discards content before the first H2', () => {
    const sections = splitIntoSections('# Title\nSome preamble\n## Section\nBody');
    expect(sections).toHaveLength(1);
    expect(sections[0].body.join('\n')).not.toContain('preamble');
  });
});

describe('convertMarkdownToProject', () => {
  it('creates one node per H2 section with a heuristic kind', () => {
    const project = convertMarkdownToProject(ONE_PAGER);
    expect(project.objects).toHaveLength(4);
    expect(project.title).toBe('[Game Name] — Concept');

    const byTitle = Object.fromEntries(project.objects.map((node) => [node.title, node]));
    expect(byTitle['UI/UX'].kind).toBe('ui');
    expect(byTitle['Core Mechanics'].kind).toBe('mechanic');
    expect(byTitle['Platform & Engine'].kind).toBe('asset');
    // "Game in One Sentence" matches no keyword, so it falls back to entity.
    expect(byTitle['Game in One Sentence'].kind).toBe('entity');
  });

  it('places every node on the active page with non-overlapping grid coordinates', () => {
    const project = convertMarkdownToProject(ONE_PAGER);
    expect(project.placements).toHaveLength(project.objects.length);
    const positions = project.placements.map((placement) => `${placement.x},${placement.y}`);
    expect(new Set(positions).size).toBe(positions.length);
    for (const placement of project.placements) expect(placement.pageId).toBe(project.activePageId);
  });

  it('does not fabricate relations between nodes', () => {
    const project = convertMarkdownToProject(ONE_PAGER);
    expect(project.relations).toEqual([]);
  });

  it('turns an Open Questions section into an unchecked checklist instead of prose', () => {
    const project = convertMarkdownToProject(IDEA_WITH_OPEN_QUESTIONS);
    const openQuestions = project.objects.find((node) => node.title === 'Open Questions')!;
    expect(openQuestions.kind).toBe('risk');
    expect(openQuestions.checklist).toEqual([
      { id: expect.any(String), text: 'What is the core monetization loop?', done: false },
      { id: expect.any(String), text: 'Should there be a multiplayer mode?', done: false },
    ]);
  });

  it('classifies narrative, economy, goal and risk headings into their dedicated kinds', () => {
    const markdown = `# Sample\n\n## Narrative Beats\nBody\n\n## Economy Loop\nBody\n\n## Success Metrics\nBody\n\n## Key Risks\nBody\n`;
    const project = convertMarkdownToProject(markdown);
    const byTitle = Object.fromEntries(project.objects.map((node) => [node.title, node]));
    expect(byTitle['Narrative Beats'].kind).toBe('narrative');
    expect(byTitle['Economy Loop'].kind).toBe('system');
    expect(byTitle['Success Metrics'].kind).toBe('goal');
    expect(byTitle['Key Risks'].kind).toBe('risk');
  });

  it('honors a title override', () => {
    const project = convertMarkdownToProject(ONE_PAGER, 'Custom Title');
    expect(project.title).toBe('Custom Title');
  });

  it('produces output that satisfies the current project schema', () => {
    // convertMarkdownToProject already runs ProjectSchema.parse internally;
    // this test exists so a future schema-version bump fails here first,
    // not silently in the CLI.
    expect(() => convertMarkdownToProject(ONE_PAGER)).not.toThrow();
  });

  it('classifies Turkish headings and detects "Açık Sorular" as open questions', () => {
    const project = convertMarkdownToProject(TURKISH_ONE_PAGER);
    const byTitle = Object.fromEntries(project.objects.map((node) => [node.title, node]));

    expect(byTitle['Temel Mekanikler (3-5 madde)'].kind).toBe('mechanic');
    expect(byTitle['Platform & Motor'].kind).toBe('asset');

    const openQuestions = byTitle['Açık Sorular'];
    expect(openQuestions.kind).toBe('risk');
    expect(openQuestions.checklist).toHaveLength(2);
    expect(openQuestions.checklist[0].text).toBe('Seviye Geçişi nasıl sunulacak?');
  });
});
