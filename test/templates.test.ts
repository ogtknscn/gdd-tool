import { describe, expect, it } from 'vitest';
import { findTemplate, templates } from '../src/domain/templates';
import { ProjectSchema } from '../src/domain/types';

describe('starter templates', () => {
  it('offers blank, flow and puzzle templates with useful welcome metadata', () => {
    expect(templates.map((item) => item.id)).toEqual(['blank', 'core-loop', 'quest', 'puzzle-level', 'puzzle-tutorial']);
    expect(templates.every((item) => item.category && item.useCase && item.startingCounts && item.preview)).toBe(true);
  });
  it('creates valid projects with separated objects and placements', () => {
    const project = findTemplate('core-loop').create();
    expect(ProjectSchema.parse(project)).toEqual(project);
    expect(project.objects).toHaveLength(4);
    expect(project.placements).toHaveLength(4);
    expect(project.relations).toHaveLength(3);
    expect(project.groups).toEqual([]);
  });
  it('creates puzzle templates with logical groups and fresh project/page identities', () => {
    const first = findTemplate('puzzle-level').create(); const second = findTemplate('puzzle-level').create(); const tutorial = findTemplate('puzzle-tutorial').create();
    expect(first.groups).toHaveLength(3); expect(tutorial.groups).toHaveLength(3);
    expect(first.objects).toHaveLength(9); expect(tutorial.objects).toHaveLength(7);
    expect(first.id).not.toBe(second.id); expect(first.activePageId).not.toBe(second.activePageId);
    expect(ProjectSchema.parse(tutorial)).toEqual(tutorial);
  });
});
