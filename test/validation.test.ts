import { describe, expect, it } from 'vitest';
import { emptyProject } from '../src/domain/project';
import { validateProject } from '../src/domain/validation';

describe('validation engine', () => {
  it('detects broken references, invisible items, duplicates and requires cycles', () => {
    const project = emptyProject(); const pageId = project.activePageId;
    const details = { status: 'draft' as const, tags: [], designIntent: '', playerExperience: '', specification: '', testNotes: '', properties: {}, checklist: [] };
    project.objects = [
      { id: 'a', pageId, kind: 'mechanic', title: 'A', summary: '', ...details },
      { id: 'b', pageId, kind: 'mechanic', title: 'B', summary: '', ...details },
    ];
    project.placements = [{ nodeId: 'a', pageId, x: 0, y: 0 }];
    project.relations = [
      { id: 'e1', pageId, source: 'a', target: 'b', kind: 'requires', customLabel: '' },
      { id: 'e2', pageId, source: 'b', target: 'a', kind: 'requires', customLabel: '' },
      { id: 'e3', pageId, source: 'a', target: 'missing', kind: 'affects', customLabel: '' },
      { id: 'e4', pageId, source: 'a', target: 'missing', kind: 'affects', customLabel: '' },
    ];
    const codes = validateProject(project, 'tr').map((issue) => issue.code);
    expect(codes).toEqual(expect.arrayContaining(['invisible-node', 'broken-reference', 'duplicate-edge', 'requires-cycle']));
  });
  it('accepts a valid empty project', () => expect(validateProject(emptyProject(), 'tr')).toEqual([]));
  it('reports invalid group members, duplicate members, blank titles and parent cycles', () => {
    const project = emptyProject(); const pageId = project.activePageId;
    const details = { status: 'draft' as const, tags: [], designIntent: '', playerExperience: '', specification: '', testNotes: '', properties: {}, checklist: [] };
    project.objects = [{ id: 'a', pageId, kind: 'mechanic', title: 'A', summary: '', ...details }];
    project.groups = [{ id: 'g1', pageId, title: '', color: '#7058dd', memberNodeIds: ['a', 'a', 'missing'], parentGroupId: 'g2', collapsed: false }, { id: 'g2', pageId, title: 'Parent', color: '#19b8b2', memberNodeIds: [], parentGroupId: 'g1', collapsed: false }];
    const codes = validateProject(project, 'tr').map((issue) => issue.code);
    expect(codes).toEqual(expect.arrayContaining(['blank-group-title', 'duplicate-group-member', 'invalid-group-member', 'group-parent-cycle']));
  });
});
