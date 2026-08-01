import { z } from 'zod';
import type { Language } from './i18n';

export const nodeKinds = ['mechanic', 'entity', 'level', 'quest', 'ui', 'asset', 'narrative', 'system', 'goal', 'risk'] as const;
export type NodeKind = (typeof nodeKinds)[number];

export const edgeKinds = ['requires', 'affects', 'produces', 'tested_by', 'conflicts_with', 'teaches'] as const;
export type EdgeKind = (typeof edgeKinds)[number];

export const nodeStatuses = ['draft', 'in_progress', 'validated', 'archived'] as const;
export type NodeStatus = (typeof nodeStatuses)[number];

export const GddPageSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
});
export type GddPage = z.infer<typeof GddPageSchema>;

export const ChecklistItemSchema = z.object({
  id: z.string().min(1),
  text: z.string(),
  done: z.boolean(),
});
export type ChecklistItem = z.infer<typeof ChecklistItemSchema>;

export const GddNodeSchema = z.object({
  id: z.string().min(1),
  pageId: z.string().min(1),
  kind: z.enum(nodeKinds),
  title: z.string().min(1),
  summary: z.string().default(''),
  status: z.enum(nodeStatuses).default('draft'),
  tags: z.array(z.string()).default([]),
  designIntent: z.string().default(''),
  playerExperience: z.string().default(''),
  specification: z.string().default(''),
  testNotes: z.string().default(''),
  properties: z.record(z.string(), z.string()).default({}),
  checklist: z.array(ChecklistItemSchema),
});
export type GddNode = z.infer<typeof GddNodeSchema>;

export const PlacementSchema = z.object({
  nodeId: z.string(),
  pageId: z.string(),
  x: z.number(),
  y: z.number(),
});
export type Placement = z.infer<typeof PlacementSchema>;

export const MAX_EDGE_LABEL_LENGTH = 120;

export const GddEdgeSchema = z.object({
  id: z.string().min(1),
  pageId: z.string(),
  source: z.string(),
  target: z.string(),
  kind: z.enum(edgeKinds),
  customLabel: z.string().max(MAX_EDGE_LABEL_LENGTH),
});
export type GddEdge = z.infer<typeof GddEdgeSchema>;

export const GddGroupSchema = z.object({
  id: z.string().min(1),
  pageId: z.string().min(1),
  title: z.string(),
  color: z.string().min(1),
  memberNodeIds: z.array(z.string()),
  parentGroupId: z.string().min(1).optional(),
  collapsed: z.boolean().default(false),
});
export type GddGroup = z.infer<typeof GddGroupSchema>;

export const PlaygroundItemSchema = z.object({
  id: z.string().min(1),
  pageId: z.string().min(1),
  type: z.enum(['sticky', 'text', 'comment', 'image']),
  text: z.string(),
  // Only set for type 'image': a data: URL (the image embedded inline, see
  // domain/image.ts for why - keeps the project a single portable file
  // instead of a project-plus-asset-folder pair).
  imageData: z.string().optional(),
  x: z.number(),
  y: z.number(),
});
export type PlaygroundItem = z.infer<typeof PlaygroundItemSchema>;

export const ProjectSchema = z.object({
  schemaVersion: z.literal(7),
  id: z.string(),
  title: z.string(),
  updatedAt: z.string(),
  pages: z.array(GddPageSchema).min(1),
  activePageId: z.string().min(1),
  objects: z.array(GddNodeSchema),
  placements: z.array(PlacementSchema),
  relations: z.array(GddEdgeSchema),
  groups: z.array(GddGroupSchema),
  playgroundItems: z.array(PlaygroundItemSchema),
});
export type ProjectModel = z.infer<typeof ProjectSchema>;

const NODE_LABELS_BY_LANGUAGE: Record<Language, Record<NodeKind, string>> = {
  tr: { mechanic: 'Mekanik', entity: 'Varlık', level: 'Bölüm', quest: 'Görev', ui: 'Arayüz', asset: 'Asset', narrative: 'Anlatı', system: 'Sistem', goal: 'Hedef', risk: 'Risk' },
  en: { mechanic: 'Mechanic', entity: 'Entity', level: 'Level', quest: 'Quest', ui: 'UI', asset: 'Asset', narrative: 'Narrative', system: 'System', goal: 'Goal', risk: 'Risk' },
};
export const nodeLabel = (kind: NodeKind, language: Language): string => NODE_LABELS_BY_LANGUAGE[language][kind];

const EDGE_LABELS_BY_LANGUAGE: Record<Language, Record<EdgeKind, string>> = {
  tr: { requires: 'Gerektirir', affects: 'Etkiler', produces: 'Üretir', tested_by: 'Test edilir', conflicts_with: 'Çakışır', teaches: 'Öğretir' },
  en: { requires: 'Requires', affects: 'Affects', produces: 'Produces', tested_by: 'Tested by', conflicts_with: 'Conflicts with', teaches: 'Teaches' },
};
export const edgeLabel = (kind: EdgeKind, language: Language): string => EDGE_LABELS_BY_LANGUAGE[language][kind];

const STATUS_LABELS_BY_LANGUAGE: Record<Language, Record<NodeStatus, string>> = {
  tr: { draft: 'Taslak', in_progress: 'Üzerinde çalışılıyor', validated: 'Doğrulandı', archived: 'Arşivlendi' },
  en: { draft: 'Draft', in_progress: 'In progress', validated: 'Validated', archived: 'Archived' },
};
export const statusLabel = (status: NodeStatus, language: Language): string => STATUS_LABELS_BY_LANGUAGE[language][status];
