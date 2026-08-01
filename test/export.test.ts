import { describe, expect, it } from 'vitest';
import { projectMarkdown, projectSvg } from '../src/domain/export';
import { createObject, emptyProject } from '../src/domain/project';
import type { ProjectModel } from '../src/domain/types';

describe('projectSvg', () => {
  it('escapes apostrophes in node titles instead of corrupting them with "undefined"', () => {
    const base = emptyProject();
    const node = createObject('mechanic', base.activePageId, "Oyuncu'nun kalkanı");
    const project: ProjectModel = {
      ...base,
      objects: [node],
      placements: [{ nodeId: node.id, pageId: base.activePageId, x: 0, y: 0 }],
    };
    const svg = projectSvg(project, 'tr');
    expect(svg).toContain('Oyuncu&#39;nun kalkanı');
    expect(svg).not.toContain('undefined');
  });
});

describe('projectMarkdown', () => {
  it('exports every long field and structural labels in English, while leaving user content untranslated', () => {
    const base = emptyProject();
    const node = {
      ...createObject('mechanic', base.activePageId, 'Kalkan Kırma'),
      summary: 'Kısa özet',
      designIntent: 'Oyuncuyu zamanlamaya zorlar.',
      playerExperience: 'Gerilim ve rahatlama.',
      specification: 'Kalkan 3 vuruşta kırılır.',
      testNotes: 'Farklı vuruş hızlarında test et.',
      tags: ['savaş', 'çekirdek'],
      checklist: [{ id: 'c1', text: 'Ses efekti ekle', done: false }],
    };
    const other = createObject('entity', base.activePageId, 'Zırh');
    const project: ProjectModel = {
      ...base,
      objects: [node, other],
      placements: [
        { nodeId: node.id, pageId: base.activePageId, x: 0, y: 0 },
        { nodeId: other.id, pageId: base.activePageId, x: 100, y: 0 },
      ],
      relations: [{ id: 'e1', pageId: base.activePageId, source: node.id, target: other.id, kind: 'affects', customLabel: '' }],
    };
    const markdown = projectMarkdown(project);

    for (const label of ['Kind:', 'Status:', 'Summary:', 'Tags:', 'Design Intent:', 'Player Experience:', 'Specification:', 'Test Notes:', 'Checklist:', 'Connections']) {
      expect(markdown).toContain(label);
    }
    expect(markdown).toContain(node.designIntent);
    expect(markdown).toContain(node.playerExperience);
    expect(markdown).toContain(node.specification);
    expect(markdown).toContain(node.testNotes);
    expect(markdown).toContain('Kalkan Kırma -> Zırh: affects');
    expect(markdown).not.toMatch(/Tasarım Niyeti|Tür:|Durum:|Bağlantılar/);
  });
});
