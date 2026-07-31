import { create } from 'zustand';
import { createId, createObject, emptyProject, touch } from '../domain/project';
import { findTemplate, type TemplateId } from '../domain/templates';
import { MAX_EDGE_LABEL_LENGTH, type EdgeKind, type GddEdge, type GddGroup, type GddNode, type NodeKind, type ProjectModel } from '../domain/types';

const copy = (project: ProjectModel): ProjectModel => JSON.parse(JSON.stringify(project)) as ProjectModel;
const fingerprint = (project: ProjectModel): string => {
  const { updatedAt: _updatedAt, activePageId: _activePageId, ...content } = project;
  return JSON.stringify(content);
};
type State = {
  project: ProjectModel; selectedNodeId?: string; detailNodeId?: string; currentFilePath?: string; dirty: boolean; savedFingerprint?: string; undoStack: ProjectModel[]; redoStack: ProjectModel[];
  select: (id?: string) => void; openDetail: (id: string) => void; closeDetail: () => void; applyTemplate: (id: TemplateId) => void; newProject: () => void;
  setActivePage: (id: string) => void; addPage: (title?: string) => void; renamePage: (id: string, title: string) => void; deletePage: (id: string) => void;
  addNode: (kind: NodeKind) => void; addNodeAt: (kind: NodeKind, position: { x: number; y: number }, sourceId?: string, edgeKind?: EdgeKind) => void; duplicateNode: (id: string) => void; removeNode: (id: string) => void; updateNode: (id: string, patch: Partial<Pick<GddNode, 'title' | 'summary' | 'status' | 'tags' | 'designIntent' | 'playerExperience' | 'specification' | 'testNotes' | 'properties'>>) => void; addChecklistItem: (nodeId: string, text?: string) => void; updateChecklistItem: (nodeId: string, itemId: string, text: string) => void; toggleChecklistItem: (nodeId: string, itemId: string) => void; removeChecklistItem: (nodeId: string, itemId: string) => void; moveChecklistItem: (nodeId: string, itemId: string, direction: -1 | 1) => void;
  createGroup: (title: string, color: string, memberNodeIds: string[]) => void; updateGroup: (id: string, patch: Partial<Pick<GddGroup, 'title' | 'color' | 'parentGroupId'>>) => void; deleteGroup: (id: string) => void; addGroupMembers: (id: string, nodeIds: string[]) => void; removeGroupMembers: (id: string, nodeIds: string[]) => void;
  moveNode: (id: string, x: number, y: number) => void; addRelation: (source: string, target: string, kind: EdgeKind) => void;
  updateRelation: (id: string, patch: Partial<Pick<GddEdge, 'customLabel'>>) => void; removeRelation: (id: string) => void; undo: () => void; redo: () => void; replaceProject: (project: ProjectModel, filePath?: string, recovered?: boolean) => void;
  markSaved: (filePath?: string) => void;
};

const mutate = (set: (partial: Partial<State>) => void, get: () => State, recipe: (project: ProjectModel) => ProjectModel) => {
  const before = copy(get().project); const next = recipe(copy(before));
  if (JSON.stringify(before) === JSON.stringify(next)) return;
  const project = touch(next);
  set({ project, undoStack: [...get().undoStack, before], redoStack: [], dirty: fingerprint(project) !== get().savedFingerprint });
};

export const useProjectStore = create<State>((set, get) => ({
  project: emptyProject(), dirty: false, undoStack: [], redoStack: [],
  select: (selectedNodeId) => set({ selectedNodeId }),
  openDetail: (detailNodeId) => set({ detailNodeId, selectedNodeId: detailNodeId }), closeDetail: () => set({ detailNodeId: undefined }),
  applyTemplate: (id) => { const project = findTemplate(id).create(); set({ project, selectedNodeId: project.objects[0]?.id, detailNodeId: undefined, currentFilePath: undefined, savedFingerprint: undefined, dirty: true, undoStack: [], redoStack: [] }); },
  newProject: () => { const project = emptyProject(); set({ project, selectedNodeId: undefined, detailNodeId: undefined, currentFilePath: undefined, savedFingerprint: fingerprint(project), dirty: false, undoStack: [], redoStack: [] }); },
  setActivePage: (id) => { if (!get().project.pages.some((page) => page.id === id)) return; set({ project: { ...get().project, activePageId: id }, selectedNodeId: undefined, detailNodeId: undefined }); },
  addPage: (title = 'Yeni Sayfa') => mutate(set, get, (project) => { const id = createId('page'); return { ...project, pages: [...project.pages, { id, title }], activePageId: id }; }),
  renamePage: (id, title) => mutate(set, get, (project) => ({ ...project, pages: project.pages.map((page) => page.id === id ? { ...page, title: title.trim() || 'İsimsiz Sayfa' } : page) })),
  deletePage: (id) => mutate(set, get, (project) => {
    if (project.pages.length === 1) return project;
    const pages = project.pages.filter((page) => page.id !== id); const nodeIds = new Set(project.objects.filter((node) => node.pageId === id).map((node) => node.id));
    return { ...project, pages, activePageId: project.activePageId === id ? pages[0].id : project.activePageId, objects: project.objects.filter((node) => node.pageId !== id), placements: project.placements.filter((place) => place.pageId !== id && !nodeIds.has(place.nodeId)), relations: project.relations.filter((edge) => edge.pageId !== id && !nodeIds.has(edge.source) && !nodeIds.has(edge.target)), groups: project.groups.filter((group) => group.pageId !== id).map((group) => group.parentGroupId && !project.groups.some((candidate) => candidate.id === group.parentGroupId && candidate.pageId !== id) ? { ...group, parentGroupId: undefined } : group) };
  }),
  addNode: (kind) => mutate(set, get, (project) => { const object = createObject(kind, project.activePageId); const count = project.objects.filter((node) => node.pageId === project.activePageId).length; return { ...project, objects: [...project.objects, object], placements: [...project.placements, { nodeId: object.id, pageId: project.activePageId, x: 180 + count * 30, y: 180 + count * 30 }] }; }),
  addNodeAt: (kind, position, sourceId, edgeKind = 'affects') => {
    const object = createObject(kind, get().project.activePageId);
    mutate(set, get, (project) => {
      const source = sourceId && project.objects.find((node) => node.id === sourceId && node.pageId === project.activePageId);
      const relation = source ? { id: createId('edge'), pageId: project.activePageId, source: source.id, target: object.id, kind: edgeKind, customLabel: '' } : undefined;
      return { ...project, objects: [...project.objects, object], placements: [...project.placements, { nodeId: object.id, pageId: project.activePageId, x: position.x, y: position.y }], relations: relation ? [...project.relations, relation] : project.relations };
    });
    set({ selectedNodeId: object.id, detailNodeId: undefined });
  },
  duplicateNode: (id) => mutate(set, get, (project) => { const source = project.objects.find((node) => node.id === id); if (!source) return project; const duplicateId = createId(source.kind); const place = project.placements.find((item) => item.nodeId === id); const duplicate = { ...copy({ ...project, objects: [source] }).objects[0], id: duplicateId, title: `${source.title} kopyası`, checklist: source.checklist.map((item) => ({ ...item, id: createId('check') })) }; return { ...project, objects: [...project.objects, duplicate], placements: [...project.placements, { nodeId: duplicateId, pageId: source.pageId, x: (place?.x ?? 180) + 36, y: (place?.y ?? 180) + 36 }] }; }),
  removeNode: (id) => {
    const { selectedNodeId, detailNodeId } = get();
    mutate(set, get, (project) => ({ ...project, objects: project.objects.filter((node) => node.id !== id), placements: project.placements.filter((place) => place.nodeId !== id), relations: project.relations.filter((edge) => edge.source !== id && edge.target !== id), groups: project.groups.map((group) => ({ ...group, memberNodeIds: group.memberNodeIds.filter((memberId) => memberId !== id) })) }));
    if (selectedNodeId === id || detailNodeId === id) set({ selectedNodeId: selectedNodeId === id ? undefined : selectedNodeId, detailNodeId: detailNodeId === id ? undefined : detailNodeId });
  },
  updateNode: (id, patch) => mutate(set, get, (project) => ({ ...project, objects: project.objects.map((object) => object.id === id ? { ...object, ...patch } : object) })),
  addChecklistItem: (nodeId, text = '') => mutate(set, get, (project) => ({ ...project, objects: project.objects.map((node) => node.id === nodeId ? { ...node, checklist: [...node.checklist, { id: createId('check'), text, done: false }] } : node) })),
  updateChecklistItem: (nodeId, itemId, text) => mutate(set, get, (project) => ({ ...project, objects: project.objects.map((node) => node.id === nodeId ? { ...node, checklist: node.checklist.map((item) => item.id === itemId ? { ...item, text } : item) } : node) })),
  toggleChecklistItem: (nodeId, itemId) => mutate(set, get, (project) => ({ ...project, objects: project.objects.map((node) => node.id === nodeId ? { ...node, checklist: node.checklist.map((item) => item.id === itemId ? { ...item, done: !item.done } : item) } : node) })),
  removeChecklistItem: (nodeId, itemId) => mutate(set, get, (project) => ({ ...project, objects: project.objects.map((node) => node.id === nodeId ? { ...node, checklist: node.checklist.filter((item) => item.id !== itemId) } : node) })),
  moveChecklistItem: (nodeId, itemId, direction) => mutate(set, get, (project) => ({ ...project, objects: project.objects.map((node) => { if (node.id !== nodeId) return node; const index = node.checklist.findIndex((item) => item.id === itemId); const target = index + direction; if (index < 0 || target < 0 || target >= node.checklist.length) return node; const checklist = [...node.checklist]; [checklist[index], checklist[target]] = [checklist[target], checklist[index]]; return { ...node, checklist }; }) })),
  createGroup: (title, color, memberNodeIds) => mutate(set, get, (project) => { const pageId = project.activePageId; const validMembers = [...new Set(memberNodeIds)].filter((id) => project.objects.some((node) => node.id === id && node.pageId === pageId)); return { ...project, groups: [...project.groups, { id: createId('group'), pageId, title: title.trim() || 'Yeni grup', color, memberNodeIds: validMembers }] }; }),
  updateGroup: (id, patch) => mutate(set, get, (project) => ({ ...project, groups: project.groups.map((group) => group.id === id ? { ...group, ...patch, title: patch.title === undefined ? group.title : patch.title.trim() || 'İsimsiz grup' } : group) })),
  deleteGroup: (id) => mutate(set, get, (project) => ({ ...project, groups: project.groups.filter((group) => group.id !== id).map((group) => group.parentGroupId === id ? { ...group, parentGroupId: undefined } : group) })),
  addGroupMembers: (id, nodeIds) => mutate(set, get, (project) => ({ ...project, groups: project.groups.map((group) => group.id !== id ? group : { ...group, memberNodeIds: [...new Set([...group.memberNodeIds, ...nodeIds.filter((nodeId) => project.objects.some((node) => node.id === nodeId && node.pageId === group.pageId))])] }) })),
  removeGroupMembers: (id, nodeIds) => mutate(set, get, (project) => { const members = new Set(nodeIds); return { ...project, groups: project.groups.map((group) => group.id === id ? { ...group, memberNodeIds: group.memberNodeIds.filter((nodeId) => !members.has(nodeId)) } : group) }; }),
  moveNode: (id, x, y) => mutate(set, get, (project) => ({ ...project, placements: project.placements.map((place) => place.nodeId === id ? { ...place, x, y } : place) })),
  addRelation: (source, target, kind) => mutate(set, get, (project) => source === target || project.relations.some((edge) => edge.source === source && edge.target === target && edge.kind === kind) ? project : { ...project, relations: [...project.relations, { id: createId('edge'), pageId: project.activePageId, source, target, kind, customLabel: '' }] }),
  updateRelation: (id, patch) => mutate(set, get, (project) => ({ ...project, relations: project.relations.map((edge) => edge.id === id ? { ...edge, ...patch, customLabel: (patch.customLabel ?? edge.customLabel).slice(0, MAX_EDGE_LABEL_LENGTH) } : edge) })),
  removeRelation: (id) => mutate(set, get, (project) => ({ ...project, relations: project.relations.filter((edge) => edge.id !== id) })),
  undo: () => { const { undoStack, project, redoStack, savedFingerprint } = get(); if (!undoStack.length) return; const previous = undoStack.at(-1)!; set({ project: previous, selectedNodeId: undefined, detailNodeId: undefined, undoStack: undoStack.slice(0, -1), redoStack: [copy(project), ...redoStack], dirty: fingerprint(previous) !== savedFingerprint }); },
  redo: () => { const { redoStack, project, undoStack, savedFingerprint } = get(); if (!redoStack.length) return; const next = redoStack[0]; set({ project: next, selectedNodeId: undefined, detailNodeId: undefined, redoStack: redoStack.slice(1), undoStack: [...undoStack, copy(project)], dirty: fingerprint(next) !== savedFingerprint }); },
  replaceProject: (project, currentFilePath, recovered = false) => set({ project: copy(project), selectedNodeId: undefined, detailNodeId: undefined, currentFilePath, savedFingerprint: recovered ? undefined : fingerprint(project), dirty: recovered, undoStack: [], redoStack: [] }),
  markSaved: (currentFilePath) => set((state) => ({ dirty: false, savedFingerprint: fingerprint(state.project), currentFilePath: currentFilePath ?? state.currentFilePath })),
}));
