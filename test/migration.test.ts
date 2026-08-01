import { describe, expect, it } from 'vitest';
import { parseAndMigrateProject } from '../src/domain/project';

describe('project migration', () => {
  it('migrates schema v1 into V4 without losing data', () => {
    const migrated = parseAndMigrateProject({ schemaVersion: 1, id: 'p1', title: 'Eski proje', updatedAt: '2026-01-01T00:00:00.000Z', objects: [{ id: 'n1', kind: 'mechanic', title: 'Zıplama', summary: '', properties: {} }], placements: [{ nodeId: 'n1', x: 10, y: 20 }], relations: [] });
    expect(migrated.schemaVersion).toBe(7);
    expect(migrated.pages).toEqual([{ id: 'page-overview', title: 'Genel Bakış' }]);
    expect(migrated.objects[0]).toMatchObject({ id: 'n1', pageId: 'page-overview', status: 'draft', tags: [], designIntent: '', playerExperience: '', specification: '', testNotes: '' });
    expect(migrated.placements[0]).toMatchObject({ nodeId: 'n1', pageId: 'page-overview' });
    expect(migrated.groups).toEqual([]);
  });
  it('migrates schema v2 while preserving content and custom properties', () => {
    const migrated = parseAndMigrateProject({ schemaVersion: 2, id: 'p2', title: 'V2 proje', updatedAt: '2026-01-02T00:00:00.000Z', pages: [{ id: 'page-1', title: 'Savaş' }], activePageId: 'page-1', objects: [{ id: 'n2', pageId: 'page-1', kind: 'mechanic', title: 'Kaçınma', summary: 'Zamanlamalı hareket', properties: { cooldown: '1 saniye' } }], placements: [{ nodeId: 'n2', pageId: 'page-1', x: 30, y: 40 }], relations: [] });
    expect(migrated.schemaVersion).toBe(7);
    expect(migrated.objects[0]).toMatchObject({ title: 'Kaçınma', summary: 'Zamanlamalı hareket', properties: { cooldown: '1 saniye' }, status: 'draft', tags: [] });
    expect(migrated.relations).toEqual([]);
  });
  it('migrates existing V3 projects with default relation labels and groups', () => {
    const migrated = parseAndMigrateProject({ schemaVersion: 3, id: 'p3', title: 'Etiketli', updatedAt: '2026-01-02T00:00:00.000Z', pages: [{ id: 'page-1', title: 'Genel Bakış' }], activePageId: 'page-1', objects: [], placements: [], relations: [{ id: 'e1', pageId: 'page-1', source: 'a', target: 'b', kind: 'affects' }, { id: 'e2', pageId: 'page-1', source: 'b', target: 'a', kind: 'requires', customLabel: 'Özel not' }] });
    expect(migrated.relations[0].customLabel).toBe('');
    expect(migrated.relations[1].customLabel).toBe('Özel not');
    expect(migrated.groups).toEqual([]);
  });
  it('preserves a V5 group\'s collapsed state instead of resetting it to expanded', () => {
    const node = { id: 'n1', pageId: 'page-1', kind: 'mechanic', title: 'Zıplama', summary: '', status: 'draft', tags: [], designIntent: '', playerExperience: '', specification: '', testNotes: '', properties: {}, checklist: [] };
    const migrated = parseAndMigrateProject({ schemaVersion: 5, id: 'p5', title: 'V5 proje', updatedAt: '2026-01-05T00:00:00.000Z', pages: [{ id: 'page-1', title: 'Genel Bakış' }], activePageId: 'page-1', objects: [node], placements: [{ nodeId: 'n1', pageId: 'page-1', x: 0, y: 0 }], relations: [], groups: [{ id: 'g1', pageId: 'page-1', title: 'Grup', color: '#7058dd', memberNodeIds: ['n1'], collapsed: true }] });
    expect(migrated.groups[0]).toMatchObject({ collapsed: true });
  });
  it('migrates a frozen V6 file (validated against its own schema, not the current one)', () => {
    const migrated = parseAndMigrateProject({
      schemaVersion: 6, id: 'p6', title: 'V6 proje', updatedAt: '2026-01-06T00:00:00.000Z',
      pages: [{ id: 'page-1', title: 'Genel Bakış' }], activePageId: 'page-1', objects: [], placements: [], relations: [],
      groups: [{ id: 'g1', pageId: 'page-1', title: 'Grup', color: '#7058dd', memberNodeIds: [], collapsed: true }],
    });
    expect(migrated.schemaVersion).toBe(7);
    expect(migrated.playgroundItems).toEqual([]);
    expect(migrated.groups[0]).toMatchObject({ collapsed: true });
  });
  it('rejects a V6 file that does not match the frozen V6 shape instead of silently trusting it', () => {
    expect(() => parseAndMigrateProject({ schemaVersion: 6, id: 'p6', title: 'Bozuk', updatedAt: '2026-01-06T00:00:00.000Z', pages: [], activePageId: '', objects: [], placements: [], relations: [], groups: [] })).toThrow();
  });
  it('rejects a file from an unrecognized, newer schema version instead of silently misreading it as V1', () => {
    expect(() => parseAndMigrateProject({ schemaVersion: 8, id: 'p8', title: 'Gelecek sürüm', updatedAt: '2026-01-01T00:00:00.000Z' })).toThrow(/schemaVersion \(8\)/);
  });
});
