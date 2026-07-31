import { z } from 'zod';
import { GddEdgeSchema, PlacementSchema, ProjectSchema, nodeKinds, type GddNode, type NodeKind, type ProjectModel } from './types';

export const createId = (prefix: string) => `${prefix}-${crypto.randomUUID()}`;
export const emptyProject = (): ProjectModel => {
  const pageId = createId('page');
  return { schemaVersion: 3, id: createId('project'), title: 'Yeni oyun tasarımı', updatedAt: new Date().toISOString(), pages: [{ id: pageId, title: 'Genel Bakış' }], activePageId: pageId, objects: [], placements: [], relations: [] };
};
export const createObject = (kind: NodeKind, pageId: string, title = 'Yeni öğe'): GddNode => ({ id: createId(kind), pageId, kind, title, summary: '', status: 'draft', tags: [], designIntent: '', playerExperience: '', specification: '', testNotes: '', properties: {} });
export const touch = (project: ProjectModel): ProjectModel => ({ ...project, updatedAt: new Date().toISOString() });

const LegacyNodeSchema = z.object({ id: z.string().min(1), kind: z.enum(nodeKinds), title: z.string().min(1), summary: z.string().default(''), properties: z.record(z.string(), z.string()).default({}) });
const V1Schema = z.object({
  schemaVersion: z.literal(1), id: z.string(), title: z.string(), updatedAt: z.string(),
  objects: z.array(LegacyNodeSchema), placements: z.array(PlacementSchema.omit({ pageId: true })), relations: z.array(GddEdgeSchema.omit({ pageId: true })),
});
const V2Schema = z.object({ schemaVersion: z.literal(2), id: z.string(), title: z.string(), updatedAt: z.string(), pages: z.array(z.object({ id: z.string(), title: z.string() })).min(1), activePageId: z.string(), objects: z.array(LegacyNodeSchema.extend({ pageId: z.string() })), placements: z.array(PlacementSchema), relations: z.array(GddEdgeSchema) });
const upgradeNode = (node: z.infer<typeof LegacyNodeSchema> & { pageId: string }): GddNode => ({ ...node, status: 'draft', tags: [], designIntent: '', playerExperience: '', specification: '', testNotes: '' });

export function parseAndMigrateProject(value: unknown): ProjectModel {
  const version = z.object({ schemaVersion: z.number() }).passthrough().parse(value).schemaVersion;
  if (version === 3) return ProjectSchema.parse(value);
  let v2: z.infer<typeof V2Schema>;
  if (version === 2) v2 = V2Schema.parse(value);
  else {
    const legacy = V1Schema.parse(value); const pageId = 'page-overview';
    v2 = { ...legacy, schemaVersion: 2, pages: [{ id: pageId, title: 'Genel Bakış' }], activePageId: pageId, objects: legacy.objects.map((item) => ({ ...item, pageId })), placements: legacy.placements.map((item) => ({ ...item, pageId })), relations: legacy.relations.map((item) => ({ ...item, pageId })) };
  }
  return ProjectSchema.parse({ ...v2, schemaVersion: 3, objects: v2.objects.map(upgradeNode) });
}
