import { describe, expect, it } from 'vitest';
import { findTemplate, templates } from '../src/domain/templates';
import { ProjectSchema } from '../src/domain/types';

describe('starter templates', () => {
  it('offers the three initial templates', () => expect(templates.map((item) => item.id)).toEqual(['blank', 'core-loop', 'quest']));
  it('creates valid projects with separated objects and placements', () => {
    const project = findTemplate('core-loop').create();
    expect(ProjectSchema.parse(project)).toEqual(project);
    expect(project.objects).toHaveLength(4);
    expect(project.placements).toHaveLength(4);
    expect(project.relations).toHaveLength(3);
  });
});
