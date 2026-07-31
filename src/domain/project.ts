import { z } from 'zod';
import { GddEdgeSchema, GddNodeSchema, PlacementSchema, ProjectSchema, nodeKinds, type GddNode, type NodeKind, type ProjectModel } from './types';

export const createId = (prefix: string) => `${prefix}-${crypto.randomUUID()}`;
export const emptyProject = (): ProjectModel => {
  const pageId = createId('page');
  return { schemaVersion: 4, id: createId('project'), title: 'Yeni oyun tasarımı', updatedAt: new Date().toISOString(), pages: [{ id: pageId, title: 'Genel Bakış' }], activePageId: pageId, objects: [], placements: [], relations: [], groups: [] };
};
export const createObject = (kind: NodeKind, pageId: string, title = 'Yeni öğe'): GddNode => ({ id: createId(kind), pageId, kind, title, summary: '', status: 'draft', tags: [], designIntent: '', playerExperience: '', specification: '', testNotes: '', properties: {} });
export const touch = (project: ProjectModel): ProjectModel => ({ ...project, updatedAt: new Date().toISOString() });

const LegacyNodeSchema = z.object({ id: z.string().min(1), kind: z.enum(nodeKinds), title: z.string().min(1), summary: z.string().default(''), properties: z.record(z.string(), z.string()).default({}) });
const LegacyEdgeSchema = GddEdgeSchema.extend({ customLabel: z.string().max(120).optional() });
const V1Schema = z.object({ schemaVersion: z.literal(1), id: z.string(), title: z.string(), updatedAt: z.string(), objects: z.array(LegacyNodeSchema), placements: z.array(PlacementSchema.omit({ pageId: true })), relations: z.array(LegacyEdgeSchema.omit({ pageId: true })) });
const V2Schema = z.object({ schemaVersion: z.literal(2), id: z.string(), title: z.string(), updatedAt: z.string(), pages: z.array(z.object({ id: z.string(), title: z.string() })).min(1), activePageId: z.string(), objects: z.array(LegacyNodeSchema.extend({ pageId: z.string() })), placements: z.array(PlacementSchema), relations: z.array(LegacyEdgeSchema) });
const V3Schema = z.object({ schemaVersion: z.literal(3), id: z.string(), title: z.string(), updatedAt: z.string(), pages: z.array(z.object({ id: z.string(), title: z.string() })).min(1), activePageId: z.string(), objects: z.array(GddNodeSchema), placements: z.array(PlacementSchema), relations: z.array(LegacyEdgeSchema) });
const upgradeNode = (node: z.infer<typeof LegacyNodeSchema> & { pageId: string }): GddNode => ({ ...node, status: 'draft', tags: [], designIntent: '', playerExperience: '', specification: '', testNotes: '' });

export function parseAndMigrateProject(value: unknown): ProjectModel {
  const version = z.object({ schemaVersion: z.number() }).passthrough().parse(value).schemaVersion;
  if (version === 4) return ProjectSchema.parse(value);
  if (version === 3) { const v3 = V3Schema.parse(value); return ProjectSchema.parse({ ...v3, schemaVersion: 4, relations: v3.relations.map((edge) => ({ ...edge, customLabel: edge.customLabel ?? '' })), groups: [] }); }
  let v2: z.infer<typeof V2Schema>;
  if (version === 2) v2 = V2Schema.parse(value);
  else {
    const legacy = V1Schema.parse(value); const pageId = 'page-overview';
    v2 = { ...legacy, schemaVersion: 2, pages: [{ id: pageId, title: 'Genel Bakış' }], activePageId: pageId, objects: legacy.objects.map((item) => ({ ...item, pageId })), placements: legacy.placements.map((item) => ({ ...item, pageId })), relations: legacy.relations.map((item) => ({ ...item, pageId })) };
  }
  return ProjectSchema.parse({ ...v2, schemaVersion: 4, objects: v2.objects.map(upgradeNode), relations: v2.relations.map((edge) => ({ ...edge, customLabel: edge.customLabel ?? '' })), groups: [] });
}
