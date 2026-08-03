import { z } from 'zod';
import { t, type Language } from './i18n';
import {
  ChecklistItemSchema,
  GddPageSchema,
  MAX_EDGE_LABEL_LENGTH,
  PlacementSchema,
  ProjectSchema,
  type GddNode,
  type NodeKind,
  type ProjectModel,
} from './types';

export const createId = (prefix: string) => `${prefix}-${crypto.randomUUID()}`;

export const emptyProject = (): ProjectModel => {
  const pageId = createId('page');
  return {
    schemaVersion: 8,
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

// --- Legacy schemas (V1-V7) -------------------------------------------------
// Each schema below describes exactly the on-disk shape of that historical
// schemaVersion, so old project files can still be opened. Do not "clean up"
// a legacy schema to match the current one - they must stay frozen in time.
//
// This means these schemas must not reference the *live* GddNodeSchema,
// GddEdgeSchema, GddGroupSchema, nodeKinds, or edgeKinds from types.ts -
// doing so silently breaks old files the moment the live schema changes
// (e.g. a required field added to GddNodeSchema, or a kind removed from
// nodeKinds, would retroactively fail to parse V1-V5 files even though
// nothing about those files changed). Each legacy shape is fully
// self-contained instead. (Found 2026-08-01: LegacyNodeSchema/
// LegacyDetailedNodeSchema/V5Schema were doing exactly this before this fix.)

const LEGACY_NODE_KINDS = ['mechanic', 'entity', 'level', 'quest', 'ui', 'asset'] as const;
const LEGACY_EDGE_KINDS = ['requires', 'affects', 'produces', 'tested_by'] as const;
const LEGACY_NODE_STATUSES = ['draft', 'in_progress', 'validated', 'archived'] as const;

const LegacyNodeSchema = z.object({
  id: z.string().min(1),
  kind: z.enum(LEGACY_NODE_KINDS),
  title: z.string().min(1),
  summary: z.string().default(''),
  properties: z.record(z.string(), z.string()).default({}),
});

const LegacyEdgeSchema = z.object({
  id: z.string().min(1),
  source: z.string(),
  target: z.string(),
  kind: z.enum(LEGACY_EDGE_KINDS),
  customLabel: z.string().max(MAX_EDGE_LABEL_LENGTH).optional(),
});

// Frozen shape of a fully-detailed node as of V3-V5 (adds the long fields,
// status and tags introduced by upgradeNode/upgradeV2ToV3 on top of
// LegacyNodeSchema). Independent of GddNodeSchema on purpose - see note above.
const LegacyDetailedNodeSchema = LegacyNodeSchema.extend({
  pageId: z.string(),
  status: z.enum(LEGACY_NODE_STATUSES).default('draft'),
  tags: z.array(z.string()).default([]),
  designIntent: z.string().default(''),
  playerExperience: z.string().default(''),
  specification: z.string().default(''),
  testNotes: z.string().default(''),
  checklist: z.array(ChecklistItemSchema).optional(),
});

// Frozen shape of a group as of V4-V5 (memberNodeIds/parentGroupId never
// changed since introduction) - independent of the live GddGroupSchema.
const LegacyGroupSchema = z.object({
  id: z.string().min(1),
  pageId: z.string().min(1),
  title: z.string(),
  color: z.string().min(1),
  memberNodeIds: z.array(z.string()),
  parentGroupId: z.string().min(1).optional(),
  collapsed: z.boolean().default(false),
});

const V1Schema = z.object({
  schemaVersion: z.literal(1),
  id: z.string(),
  title: z.string(),
  updatedAt: z.string(),
  objects: z.array(LegacyNodeSchema),
  placements: z.array(PlacementSchema.omit({ pageId: true })),
  relations: z.array(LegacyEdgeSchema),
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
  relations: z.array(LegacyEdgeSchema.extend({ pageId: z.string() })),
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
  relations: z.array(LegacyEdgeSchema.extend({ pageId: z.string() })),
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
  relations: z.array(LegacyEdgeSchema.extend({ pageId: z.string(), customLabel: z.string().max(MAX_EDGE_LABEL_LENGTH) })),
  groups: z.array(LegacyGroupSchema.omit({ collapsed: true })),
});

const V5Schema = z.object({
  schemaVersion: z.literal(5),
  id: z.string(),
  title: z.string(),
  updatedAt: z.string(),
  pages: z.array(z.object({ id: z.string(), title: z.string() })).min(1),
  activePageId: z.string(),
  objects: z.array(LegacyDetailedNodeSchema.extend({ checklist: z.array(ChecklistItemSchema) })),
  placements: z.array(PlacementSchema),
  relations: z.array(LegacyEdgeSchema.extend({ pageId: z.string(), customLabel: z.string().max(MAX_EDGE_LABEL_LENGTH) })),
  groups: z.array(LegacyGroupSchema),
});

// V6 was V7 minus playgroundItems (added in V7). The node/edge/group shapes
// never changed between V5 and V6, so this reuses the same frozen sub-schemas
// as V5Schema rather than the live GddNodeSchema/GddEdgeSchema/GddGroupSchema
// - the previous version of this schema referenced those live schemas
// directly, which still left V6 files exposed to future ProjectSchema
// changes despite the comment here claiming it was already frozen.
const V6Schema = z.object({
  schemaVersion: z.literal(6),
  id: z.string(),
  title: z.string(),
  updatedAt: z.string(),
  pages: z.array(GddPageSchema).min(1),
  activePageId: z.string().min(1),
  objects: z.array(LegacyDetailedNodeSchema.extend({ checklist: z.array(ChecklistItemSchema) })),
  placements: z.array(PlacementSchema),
  relations: z.array(LegacyEdgeSchema.extend({ pageId: z.string(), customLabel: z.string().max(MAX_EDGE_LABEL_LENGTH) })),
  groups: z.array(LegacyGroupSchema),
});

// V7 introduced playground items. Keep this shape frozen: V8 folds its three
// textual variants into `note` and adds a separately editable title.
const LegacyPlaygroundItemSchema = z.object({
  id: z.string().min(1), pageId: z.string().min(1),
  type: z.enum(['sticky', 'text', 'comment', 'image']), text: z.string(),
  imageData: z.string().optional(), x: z.number(), y: z.number(),
});
const V7Schema = z.object({
  schemaVersion: z.literal(7), id: z.string(), title: z.string(), updatedAt: z.string(),
  pages: z.array(GddPageSchema).min(1), activePageId: z.string().min(1),
  objects: z.array(LegacyDetailedNodeSchema.extend({ checklist: z.array(ChecklistItemSchema) })),
  placements: z.array(PlacementSchema),
  relations: z.array(LegacyEdgeSchema.extend({ pageId: z.string(), customLabel: z.string().max(MAX_EDGE_LABEL_LENGTH) })),
  groups: z.array(LegacyGroupSchema), playgroundItems: z.array(LegacyPlaygroundItemSchema),
});

const upgradeNode = (node: z.infer<typeof LegacyNodeSchema> & { pageId: string }): z.infer<typeof LegacyDetailedNodeSchema> => ({
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

function upgradeV5ToV7(v5: z.infer<typeof V5Schema>): z.infer<typeof V7Schema> {
  return V7Schema.parse({
    ...v5,
    schemaVersion: 7,
    // V5 already introduced `collapsed` (see upgradeV4ToV5) - preserve it here
    // instead of resetting every group to expanded.
    groups: v5.groups.map((group) => ({ ...group, collapsed: group.collapsed ?? false })),
    playgroundItems: [],
  });
}

function upgradeV6ToV7(value: unknown): z.infer<typeof V7Schema> {
  const v6 = V6Schema.parse(value);
  return V7Schema.parse({ ...v6, schemaVersion: 7, playgroundItems: [] });
}

function upgradeV7ToV8(value: unknown): ProjectModel {
  const v7 = V7Schema.parse(value);
  return ProjectSchema.parse({
    ...v7,
    schemaVersion: 8,
    playgroundItems: v7.playgroundItems.map((item) => ({ ...item, type: item.type === 'image' ? 'image' : 'note', title: '' })),
  });
}

export function parseAndMigrateProject(value: unknown, language: Language = 'tr'): ProjectModel {
  const version = z.object({ schemaVersion: z.number() }).passthrough().parse(value).schemaVersion;

  if (version === 8) return ProjectSchema.parse(value);
  if (version === 7) return upgradeV7ToV8(value);
  if (version === 6) return upgradeV7ToV8(upgradeV6ToV7(value));
  if (version === 5) return upgradeV7ToV8(upgradeV5ToV7(V5Schema.parse(value)));
  if (version === 4) return upgradeV7ToV8(upgradeV5ToV7(upgradeV4ToV5(V4Schema.parse(value))));
  if (version === 3) return upgradeV7ToV8(upgradeV5ToV7(upgradeV4ToV5(upgradeV3ToV4(V3Schema.parse(value)))));
  if (version === 2) return upgradeV7ToV8(upgradeV5ToV7(upgradeV4ToV5(upgradeV3ToV4(upgradeV2ToV3(V2Schema.parse(value))))));
  if (version === 1) return upgradeV7ToV8(upgradeV5ToV7(upgradeV4ToV5(upgradeV3ToV4(upgradeV2ToV3(upgradeV1ToV2(value))))));

  throw new Error(t(language, 'project.unsupportedSchemaVersion', { version }));
}
