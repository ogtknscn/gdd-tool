import { z } from 'zod';

export const nodeKinds = ['mechanic', 'entity', 'level', 'quest', 'ui', 'asset'] as const;
export type NodeKind = (typeof nodeKinds)[number];
export const edgeKinds = ['requires', 'affects', 'produces', 'tested_by'] as const;
export type EdgeKind = (typeof edgeKinds)[number];
export const nodeStatuses = ['draft', 'in_progress', 'validated', 'archived'] as const;
export type NodeStatus = (typeof nodeStatuses)[number];

export const GddPageSchema = z.object({ id: z.string().min(1), title: z.string().min(1) });
export type GddPage = z.infer<typeof GddPageSchema>;
export const ChecklistItemSchema = z.object({ id: z.string().min(1), text: z.string(), done: z.boolean() });
export type ChecklistItem = z.infer<typeof ChecklistItemSchema>;
export const GddNodeSchema = z.object({
  id: z.string().min(1), pageId: z.string().min(1), kind: z.enum(nodeKinds), title: z.string().min(1),
  summary: z.string().default(''), status: z.enum(nodeStatuses).default('draft'), tags: z.array(z.string()).default([]),
  designIntent: z.string().default(''), playerExperience: z.string().default(''), specification: z.string().default(''), testNotes: z.string().default(''),
  properties: z.record(z.string(), z.string()).default({}), checklist: z.array(ChecklistItemSchema),
});
export type GddNode = z.infer<typeof GddNodeSchema>;
export const PlacementSchema = z.object({ nodeId: z.string(), pageId: z.string(), x: z.number(), y: z.number() });
export type Placement = z.infer<typeof PlacementSchema>;
export const MAX_EDGE_LABEL_LENGTH = 120;
export const GddEdgeSchema = z.object({ id: z.string().min(1), pageId: z.string(), source: z.string(), target: z.string(), kind: z.enum(edgeKinds), customLabel: z.string().max(MAX_EDGE_LABEL_LENGTH) });
export type GddEdge = z.infer<typeof GddEdgeSchema>;
export const GddGroupSchema = z.object({ id: z.string().min(1), pageId: z.string().min(1), title: z.string(), color: z.string().min(1), memberNodeIds: z.array(z.string()), parentGroupId: z.string().min(1).optional() });
export type GddGroup = z.infer<typeof GddGroupSchema>;
export const ProjectSchema = z.object({
  schemaVersion: z.literal(5), id: z.string(), title: z.string(), updatedAt: z.string(),
  pages: z.array(GddPageSchema).min(1), activePageId: z.string().min(1),
  objects: z.array(GddNodeSchema), placements: z.array(PlacementSchema), relations: z.array(GddEdgeSchema), groups: z.array(GddGroupSchema),
});
export type ProjectModel = z.infer<typeof ProjectSchema>;

export const NODE_LABELS: Record<NodeKind, string> = { mechanic: 'Mekanik', entity: 'Varlık', level: 'Bölüm', quest: 'Görev', ui: 'Arayüz', asset: 'Asset' };
export const EDGE_LABELS: Record<EdgeKind, string> = { requires: 'Gerektirir', affects: 'Etkiler', produces: 'Üretir', tested_by: 'Test edilir' };
export const STATUS_LABELS: Record<NodeStatus, string> = { draft: 'Taslak', in_progress: 'Üzerinde çalışılıyor', validated: 'Doğrulandı', archived: 'Arşivlendi' };
