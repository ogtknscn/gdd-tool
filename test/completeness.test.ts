import { describe, expect, it } from 'vitest';
import { createObject } from '../src/domain/project';
import { nodeCompleteness, pageReadiness, readinessColor } from '../src/domain/completeness';
import type { ProjectModel } from '../src/domain/types';

describe('nodeCompleteness', () => {
  it('scores a bare node near zero and a fully filled node at one', () => {
    const bare = createObject('mechanic', 'page-1');
    const filled = { ...bare, summary: 'x', designIntent: 'x', playerExperience: 'x', specification: 'x', testNotes: 'x', status: 'validated' as const, properties: { rules: 'x', inputs: 'x', feedback: 'x' } };
    // A bare node still counts as "complete" on the empty-checklist check
    // (see nodeCompleteness's comment) - it should not be penalized for
    // having no checklist at all, only for an unfinished one.
    expect(nodeCompleteness(bare)).toBeCloseTo(1 / 10);
    expect(nodeCompleteness(filled)).toBe(1);
  });

  it('treats an empty checklist as complete but an unfinished one as incomplete', () => {
    const node = createObject('quest', 'page-1');
    const withOpenItem = { ...node, checklist: [{ id: 'c1', text: 'do it', done: false }] };
    const withDoneItem = { ...node, checklist: [{ id: 'c1', text: 'do it', done: true }] };
    expect(nodeCompleteness(withOpenItem)).toBeLessThan(nodeCompleteness(node));
    expect(nodeCompleteness(withDoneItem)).toBe(nodeCompleteness(node));
  });
});

describe('pageReadiness', () => {
  it('aggregates validated count and open checklist items across a page', () => {
    const project: ProjectModel = {
      schemaVersion: 8, id: 'p', title: 'Project', updatedAt: '', pages: [{ id: 'page-1', title: 'Page' }], activePageId: 'page-1',
      objects: [
        { ...createObject('mechanic', 'page-1', 'A'), status: 'validated', checklist: [{ id: 'c1', text: 't', done: true }] },
        { ...createObject('quest', 'page-1', 'B'), checklist: [{ id: 'c2', text: 't', done: false }, { id: 'c3', text: 't2', done: false }] },
      ],
      placements: [], relations: [], groups: [], playgroundItems: [],
    };
    const result = pageReadiness(project, 'page-1');
    expect(result).toMatchObject({ nodeCount: 2, validatedCount: 1, openChecklistItems: 2 });
    expect(result.averageCompleteness).toBeGreaterThan(0);
  });

  it('returns zeroed readiness for a page with no nodes', () => {
    const project: ProjectModel = { schemaVersion: 8, id: 'p', title: 'Project', updatedAt: '', pages: [{ id: 'page-1', title: 'Page' }], activePageId: 'page-1', objects: [], placements: [], relations: [], groups: [], playgroundItems: [] };
    expect(pageReadiness(project, 'page-1')).toMatchObject({ nodeCount: 0, averageCompleteness: 0, validatedCount: 0, openChecklistItems: 0 });
  });
});

describe('readinessColor', () => {
  it('interpolates from danger red through warning yellow to success green', () => {
    expect(readinessColor(0)).toBe('rgb(224, 85, 92)');
    expect(readinessColor(0.5)).toBe('rgb(229, 182, 74)');
    expect(readinessColor(1)).toBe('rgb(112, 201, 135)');
  });

  it('clamps out-of-range scores', () => {
    expect(readinessColor(-1)).toBe(readinessColor(0));
    expect(readinessColor(2)).toBe(readinessColor(1));
  });
});
