import { describe, expect, it } from 'vitest';
import { parseAndMigrateProject } from '../src/domain/project';

describe('project migration', () => {
  it('migrates schema v1 into V3 without losing data', () => {
    const migrated = parseAndMigrateProject({ schemaVersion: 1, id: 'p1', title: 'Eski proje', updatedAt: '2026-01-01T00:00:00.000Z', objects: [{ id: 'n1', kind: 'mechanic', title: 'Zıplama', summary: '', properties: {} }], placements: [{ nodeId: 'n1', x: 10, y: 20 }], relations: [] });
    expect(migrated.schemaVersion).toBe(3);
    expect(migrated.pages).toEqual([{ id: 'page-overview', title: 'Genel Bakış' }]);
    expect(migrated.objects[0]).toMatchObject({ id: 'n1', pageId: 'page-overview', status: 'draft', tags: [], designIntent: '', playerExperience: '', specification: '', testNotes: '' });
    expect(migrated.placements[0]).toMatchObject({ nodeId: 'n1', pageId: 'page-overview' });
  });
  it('migrates schema v2 while preserving content and custom properties', () => {
    const migrated = parseAndMigrateProject({ schemaVersion: 2, id: 'p2', title: 'V2 proje', updatedAt: '2026-01-02T00:00:00.000Z', pages: [{ id: 'page-1', title: 'Savaş' }], activePageId: 'page-1', objects: [{ id: 'n2', pageId: 'page-1', kind: 'mechanic', title: 'Kaçınma', summary: 'Zamanlamalı hareket', properties: { cooldown: '1 saniye' } }], placements: [{ nodeId: 'n2', pageId: 'page-1', x: 30, y: 40 }], relations: [] });
    expect(migrated.schemaVersion).toBe(3);
    expect(migrated.objects[0]).toMatchObject({ title: 'Kaçınma', summary: 'Zamanlamalı hareket', properties: { cooldown: '1 saniye' }, status: 'draft', tags: [] });
  });
});
