import { describe, expect, it } from 'vitest';
import { findTemplate, templates } from '../src/domain/templates';
import { ProjectSchema } from '../src/domain/types';

describe('starter templates', () => {
  it('offers blank, flow and puzzle templates with useful welcome metadata', () => {
    expect(templates.map((item) => item.id)).toEqual(['blank', 'core-loop', 'quest', 'puzzle-level', 'puzzle-tutorial', 'combat-encounter', 'economy-progression', 'branching-narrative', 'ui-flow', 'roguelite-run-loop']);
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
  it('ships the five specialised templates with editable groups, checklist and labels', () => {
    (['combat-encounter', 'economy-progression', 'branching-narrative', 'ui-flow', 'roguelite-run-loop'] as const).forEach((id) => { const project = findTemplate(id).create(); expect(ProjectSchema.parse(project)).toEqual(project); expect(project.groups.length).toBeGreaterThan(0); expect(project.groups.every((group) => !group.collapsed)).toBe(true); expect(project.objects[0].checklist.length).toBeGreaterThan(0); expect(project.relations[0].customLabel).not.toBe(''); });
  });
  it('models the economy and narrative templates with their dedicated kinds instead of generic ones', () => {
    const economy = findTemplate('economy-progression').create();
    expect(economy.objects.filter((node) => node.kind === 'system')).toHaveLength(3);
    const narrative = findTemplate('branching-narrative').create();
    expect(narrative.objects.filter((node) => node.kind === 'narrative')).toHaveLength(3);
    const tutorial = findTemplate('puzzle-tutorial').create();
    expect(tutorial.relations.find((edge) => edge.source === 'introduce' && edge.target === 'guided')?.kind).toBe('teaches');
  });
});
