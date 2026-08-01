import { z } from 'zod';
import {
  ChecklistItemSchema,
  GddEdgeSchema,
  GddGroupSchema,
  GddNodeSchema,
  GddPageSchema,
  PlacementSchema,
  ProjectSchema,
  nodeKinds,
  type GddNode,
  type NodeKind,
  type ProjectModel,
} from './types';

export const createId = (prefix: string) => `${prefix}-${crypto.randomUUID()}`;

export const emptyProject = (): ProjectModel => {
  const pageId = createId('page');
  return {
    schemaVersion: 7,
    id: createId('project'),
    title: 'Yeni oyun tasarımı',
    updatedAt: new Date().toISOString(),
    pages: [{ id: pageId, title: 'Genel Bakış' }],
    activePageId: pageId,
    objects: [],
    placements: [],
    relations: [],
    groups: [],
    playgroundItems: [],
  };
};

export const createObject = (kind: NodeKind, pageId: string, title = 'Yeni öğe'): GddNode => ({
  id: createId(kind),
  pageId,
  kind,
  title,
  summary: '',
  status: 'draft',
  tags: [],
  designIntent: '',
  playerExperience: '',
  specification: '',
  testNotes: '',
  properties: {},
  checklist: [],
});

export const touch = (project: ProjectModel): ProjectModel => ({
  ...project,
  updatedAt: new Date().toISOString(),
});

// --- Legacy schemas (V1-V6) -------------------------------------------------
// Each schema below describes exactly the on-disk shape of that historical
// schemaVersion, so old project files can still be opened. Do not "clean up"
// a legacy schema to match the current one - they must stay frozen in time.

const LegacyNodeSchema = z.object({
  id: z.string().min(1),
  kind: z.enum(nodeKinds),
  title: z.string().min(1),
  summary: z.string().default(''),
  properties: z.record(z.string(), z.string()).default({}),
});

const LegacyEdgeSchema = GddEdgeSchema.extend({
  customLabel: z.string().max(120).optional(),
});

const LegacyDetailedNodeSchema = GddNodeSchema.extend({
  checklist: z.array(ChecklistItemSchema).optional(),
});

const V1Schema = z.object({
  schemaVersion: z.literal(1),
  id: z.string(),
  title: z.string(),
  updatedAt: z.string(),
  objects: z.array(LegacyNodeSchema),
  placements: z.array(PlacementSchema.omit({ pageId: true })),
  relations: z.array(LegacyEdgeSchema.omit({ pageId: true })),
});

const V2Schema = z.object({
  schemaVersion: z.literal(2),
  id: z.string(),
  title: z.string(),
  updatedAt: z.string(),
  pages: z.array(z.object({ id: z.string(), title: z.string() })).min(1),
  activePageId: z.string(),
  objects: z.array(LegacyNodeSchema.extend({ pageId: z.string() })),
  placements: z.array(PlacementSchema),
  relations: z.array(LegacyEdgeSchema),
});

const V3Schema = z.object({
  schemaVersion: z.literal(3),
  id: z.string(),
  title: z.string(),
  updatedAt: z.string(),
  pages: z.array(z.object({ id: z.string(), title: z.string() })).min(1),
  activePageId: z.string(),
  objects: z.array(LegacyDetailedNodeSchema),
  placements: z.array(PlacementSchema),
  relations: z.array(LegacyEdgeSchema),
});

const V4Schema = z.object({
  schemaVersion: z.literal(4),
  id: z.string(),
  title: z.string(),
  updatedAt: z.string(),
  pages: z.array(z.object({ id: z.string(), title: z.string() })).min(1),
  activePageId: z.string(),
  objects: z.array(LegacyDetailedNodeSchema),
  placements: z.array(PlacementSchema),
  relations: z.array(GddEdgeSchema),
  groups: z.array(GddGroupSchema.omit({ collapsed: true })),
});

const V5Schema = z.object({
  schemaVersion: z.literal(5),
  id: z.string(),
  title: z.string(),
  updatedAt: z.string(),
  pages: z.array(z.object({ id: z.string(), title: z.string() })).min(1),
  activePageId: z.string(),
  objects: z.array(GddNodeSchema),
  placements: z.array(PlacementSchema),
  relations: z.array(GddEdgeSchema),
  groups: z.array(GddGroupSchema),
});

// V6 was V7 minus playgroundItems (added in V7); frozen exactly as it existed
// so a future ProjectSchema change can't silently break old V6 files the way
// upgradeV6ToV7 used to (it previously validated V6 input directly against
// the *current* ProjectSchema instead of its own frozen shape).
const V6Schema = z.object({
  schemaVersion: z.literal(6),
  id: z.string(),
  title: z.string(),
  updatedAt: z.string(),
  pages: z.array(GddPageSchema).min(1),
  activePageId: z.string().min(1),
  objects: z.array(GddNodeSchema),
  placements: z.array(PlacementSchema),
  relations: z.array(GddEdgeSchema),
  groups: z.array(GddGroupSchema),
});

const upgradeNode = (node: z.infer<typeof LegacyNodeSchema> & { pageId: string }): GddNode => ({
  ...node,
  status: 'draft',
  tags: [],
  designIntent: '',
  playerExperience: '',
  specification: '',
  testNotes: '',
  checklist: [],
});

// --- Sequential upgraders ----------------------------------------------------
// Each function only knows how to go from its own version to the next one.
// parseAndMigrateProject chains them so a V1 file walks V1->V2->...->V7.

function upgradeV1ToV2(value: unknown): z.infer<typeof V2Schema> {
  const legacy = V1Schema.parse(value);
  const pageId = 'page-overview';
  return {
    ...legacy,
    schemaVersion: 2,
    pages: [{ id: pageId, title: 'Genel Bakış' }],
    activePageId: pageId,
    objects: legacy.objects.map((item) => ({ ...item, pageId })),
    placements: legacy.placements.map((item) => ({ ...item, pageId })),
    relations: legacy.relations.map((item) => ({ ...item, pageId })),
  };
}

function upgradeV2ToV3(v2: z.infer<typeof V2Schema>): z.infer<typeof V3Schema> {
  return {
    ...v2,
    schemaVersion: 3,
    objects: v2.objects.map(upgradeNode),
    relations: v2.relations.map((edge) => ({ ...edge, customLabel: edge.customLabel ?? '' })),
  };
}

function upgradeV3ToV4(v3: z.infer<typeof V3Schema>): z.infer<typeof V4Schema> {
  return {
    ...v3,
    schemaVersion: 4,
    objects: v3.objects.map((node) => ({ ...node, checklist: node.checklist ?? [] })),
    relations: v3.relations.map((edge) => ({ ...edge, customLabel: edge.customLabel ?? '' })),
    groups: [],
  };
}

function upgradeV4ToV5(v4: z.infer<typeof V4Schema>): z.infer<typeof V5Schema> {
  return {
    ...v4,
    schemaVersion: 5,
    objects: v4.objects.map((node) => ({ ...node, checklist: node.checklist ?? [] })),
    groups: v4.groups.map((group) => ({ ...group, collapsed: false })),
  };
}

function upgradeV5ToV7(v5: z.infer<typeof V5Schema>): ProjectModel {
  return ProjectSchema.parse({
    ...v5,
    schemaVersion: 7,
    // V5 already introduced `collapsed` (see upgradeV4ToV5) - preserve it here
    // instead of resetting every group to expanded.
    groups: v5.groups.map((group) => ({ ...group, collapsed: group.collapsed ?? false })),
    playgroundItems: [],
  });
}

function upgradeV6ToV7(value: unknown): ProjectModel {
  const v6 = V6Schema.parse(value);
  return ProjectSchema.parse({ ...v6, schemaVersion: 7, playgroundItems: [] });
}

export function parseAndMigrateProject(value: unknown): ProjectModel {
  const version = z.object({ schemaVersion: z.number() }).passthrough().parse(value).schemaVersion;

  if (version === 7) return ProjectSchema.parse(value);
  if (version === 6) return upgradeV6ToV7(value);
  if (version === 5) return upgradeV5ToV7(V5Schema.parse(value));
  if (version === 4) return upgradeV5ToV7(upgradeV4ToV5(V4Schema.parse(value)));
  if (version === 3) return upgradeV5ToV7(upgradeV4ToV5(upgradeV3ToV4(V3Schema.parse(value))));
  if (version === 2) return upgradeV5ToV7(upgradeV4ToV5(upgradeV3ToV4(upgradeV2ToV3(V2Schema.parse(value)))));
  if (version === 1) return upgradeV5ToV7(upgradeV4ToV5(upgradeV3ToV4(upgradeV2ToV3(upgradeV1ToV2(value)))));

  throw new Error(
    `Bu proje dosyası GDD Tool'un bu sürümünün tanımadığı bir schemaVersion (${version}) içeriyor. ` +
      'Muhtemelen dosya daha yeni bir GDD Tool sürümüyle oluşturuldu; GDD Tool\'u güncelleyin.',
  );
}
