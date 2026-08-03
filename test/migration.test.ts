import { describe, expect, it } from 'vitest';
import { parseAndMigrateProject } from '../src/domain/project';

describe('project migration', () => {
  it('migrates schema v1 into V4 without losing data', () => {
    const migrated = parseAndMigrateProject({ schemaVersion: 1, id: 'p1', title: 'Eski proje', updatedAt: '2026-01-01T00:00:00.000Z', objects: [{ id: 'n1', kind: 'mechanic', title: 'Zıplama', summary: '', properties: {} }], placements: [{ nodeId: 'n1', x: 10, y: 20 }], relations: [] });
    expect(migrated.schemaVersion).toBe(8);
    expect(migrated.pages).toEqual([{ id: 'page-overview', title: 'Genel Bakış' }]);
    expect(migrated.objects[0]).toMatchObject({ id: 'n1', pageId: 'page-overview', status: 'draft', tags: [], designIntent: '', playerExperience: '', specification: '', testNotes: '' });
    expect(migrated.placements[0]).toMatchObject({ nodeId: 'n1', pageId: 'page-overview' });
    expect(migrated.groups).toEqual([]);
  });
  it('migrates schema v2 while preserving content and custom properties', () => {
    const migrated = parseAndMigrateProject({ schemaVersion: 2, id: 'p2', title: 'V2 proje', updatedAt: '2026-01-02T00:00:00.000Z', pages: [{ id: 'page-1', title: 'Savaş' }], activePageId: 'page-1', objects: [{ id: 'n2', pageId: 'page-1', kind: 'mechanic', title: 'Kaçınma', summary: 'Zamanlamalı hareket', properties: { cooldown: '1 saniye' } }], placements: [{ nodeId: 'n2', pageId: 'page-1', x: 30, y: 40 }], relations: [] });
    expect(migrated.schemaVersion).toBe(8);
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
    expect(migrated.schemaVersion).toBe(8);
    expect(migrated.playgroundItems).toEqual([]);
    expect(migrated.groups[0]).toMatchObject({ collapsed: true });
  });
  it('rejects a V6 file that does not match the frozen V6 shape instead of silently trusting it', () => {
    expect(() => parseAndMigrateProject({ schemaVersion: 6, id: 'p6', title: 'Bozuk', updatedAt: '2026-01-06T00:00:00.000Z', pages: [], activePageId: '', objects: [], placements: [], relations: [], groups: [] })).toThrow();
  });
  it('migrates every V7 text variant to a lossless note and is idempotent at V8', () => {
    const base = { schemaVersion: 7, id: 'p7', title: 'V7', updatedAt: '2026-01-07T00:00:00.000Z', pages: [{ id: 'page-1', title: 'Overview' }], activePageId: 'page-1', objects: [], placements: [], relations: [], groups: [] };
    const migrated = parseAndMigrateProject({ ...base, playgroundItems: [{ id: 'sticky', pageId: 'page-1', type: 'sticky', text: 'Pinned', x: 1, y: 2 }, { id: 'text', pageId: 'page-1', type: 'text', text: 'Body', x: 3, y: 4 }, { id: 'comment', pageId: 'page-1', type: 'comment', text: 'Comment', x: 5, y: 6 }, { id: 'image', pageId: 'page-1', type: 'image', text: 'Caption', imageData: 'data:image/png;base64,AA==', x: 7, y: 8 }] });
    expect(migrated).toMatchObject({ schemaVersion: 8, playgroundItems: [{ type: 'note', text: 'Pinned', title: '' }, { type: 'note', text: 'Body', title: '' }, { type: 'note', text: 'Comment', title: '' }, { type: 'image', imageData: 'data:image/png;base64,AA==', text: 'Caption', title: '' }] });
    expect(parseAndMigrateProject(migrated)).toEqual(migrated);
  });
  it('rejects a file from an unrecognized, newer schema version instead of silently misreading it as V1', () => {
    expect(() => parseAndMigrateProject({ schemaVersion: 9, id: 'p9', title: 'Future project', updatedAt: '2026-01-01T00:00:00.000Z' })).toThrow(/schemaVersion \(9\)/);
  });
});
