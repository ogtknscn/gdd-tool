import { describe, expect, it } from 'vitest';
import { emptyProject } from '../src/domain/project';
import { validateProject } from '../src/domain/validation';

describe('validation engine', () => {
  it('detects broken references, invisible items, duplicates and requires cycles', () => {
    const project = emptyProject(); const pageId = project.activePageId;
    const details = { status: 'draft' as const, tags: [], designIntent: '', playerExperience: '', specification: '', testNotes: '', properties: {} };
    project.objects = [
      { id: 'a', pageId, kind: 'mechanic', title: 'A', summary: '', ...details },
      { id: 'b', pageId, kind: 'mechanic', title: 'B', summary: '', ...details },
    ];
    project.placements = [{ nodeId: 'a', pageId, x: 0, y: 0 }];
    project.relations = [
      { id: 'e1', pageId, source: 'a', target: 'b', kind: 'requires' },
      { id: 'e2', pageId, source: 'b', target: 'a', kind: 'requires' },
      { id: 'e3', pageId, source: 'a', target: 'missing', kind: 'affects' },
      { id: 'e4', pageId, source: 'a', target: 'missing', kind: 'affects' },
    ];
    const codes = validateProject(project).map((issue) => issue.code);
    expect(codes).toEqual(expect.arrayContaining(['invisible-node', 'broken-reference', 'duplicate-edge', 'requires-cycle']));
  });
  it('accepts a valid empty project', () => expect(validateProject(emptyProject())).toEqual([]));
});
