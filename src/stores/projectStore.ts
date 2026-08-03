import { create } from 'zustand';
import { createId, createObject, emptyProject, touch } from '../domain/project';
import { findTemplate, type TemplateId } from '../domain/templates';
import {
  MAX_EDGE_LABEL_LENGTH,
  type EdgeKind,
  type GddEdge,
  type GddGroup,
  type GddNode,
  type NodeKind,
  type PlaygroundItem,
  type ProjectModel,
} from '../domain/types';

const copy = (project: ProjectModel): ProjectModel => JSON.parse(JSON.stringify(project)) as ProjectModel;

// Each undo entry is a full project snapshot; capping keeps memory bounded on
// long sessions without meaningfully limiting how far back a user can undo.
const MAX_UNDO_ENTRIES = 100;

// Fingerprint ignores fields that change on every mutation regardless of
// content (updatedAt) or that are pure view state (activePageId), so
// switching pages or touching the timestamp doesn't mark the project dirty.
const fingerprint = (project: ProjectModel): string => {
  const { updatedAt: _updatedAt, activePageId: _activePageId, ...content } = project;
  return JSON.stringify(content);
};

type State = {
  project: ProjectModel;
  selectedNodeId?: string;
  detailNodeId?: string;
  currentFilePath?: string;
  dirty: boolean;
  savedFingerprint?: string;
  undoStack: ProjectModel[];
  redoStack: ProjectModel[];

  select: (id?: string) => void;
  openDetail: (id: string) => void;
  closeDetail: () => void;
  applyTemplate: (id: TemplateId) => void;
  newProject: () => void;

  setActivePage: (id: string) => void;
  addPage: (title?: string) => void;
  renamePage: (id: string, title: string) => void;
  deletePage: (id: string) => void;

  addNode: (kind: NodeKind) => void;
  addIdea: (text: string) => void;
  addNodeAt: (kind: NodeKind, position: { x: number; y: number }, sourceId?: string, edgeKind?: EdgeKind) => void;
  duplicateNode: (id: string) => void;
  removeNode: (id: string) => void;
  updateNode: (id: string, patch: Partial<Pick<GddNode, 'title' | 'summary' | 'status' | 'tags' | 'designIntent' | 'playerExperience' | 'specification' | 'testNotes' | 'properties'>>) => void;
  addChecklistItem: (nodeId: string, text?: string) => void;
  updateChecklistItem: (nodeId: string, itemId: string, text: string) => void;
  toggleChecklistItem: (nodeId: string, itemId: string) => void;
  removeChecklistItem: (nodeId: string, itemId: string) => void;
  moveChecklistItem: (nodeId: string, itemId: string, direction: -1 | 1) => void;

  createGroup: (title: string, color: string, memberNodeIds: string[]) => void;
  updateGroup: (id: string, patch: Partial<Pick<GddGroup, 'title' | 'color' | 'parentGroupId' | 'collapsed'>>) => void;
  deleteGroup: (id: string) => void;
  addGroupMembers: (id: string, nodeIds: string[]) => void;
  removeGroupMembers: (id: string, nodeIds: string[]) => void;
  moveGroup: (id: string, delta: { x: number; y: number }) => void;

  moveNode: (id: string, x: number, y: number) => void;
  addRelation: (source: string, target: string, kind: EdgeKind) => void;

  addPlaygroundItem: (type: 'note', text?: string, title?: string) => void;
  addPlaygroundImage: (imageData: string, caption?: string) => void;
  updatePlaygroundItem: (id: string, patch: Partial<Pick<PlaygroundItem, 'text' | 'title'>>) => void;
  movePlaygroundItem: (id: string, x: number, y: number) => void;
  removePlaygroundItem: (id: string) => void;

  updateRelation: (id: string, patch: Partial<Pick<GddEdge, 'customLabel'>>) => void;
  removeRelation: (id: string) => void;
  undo: () => void;
  redo: () => void;
  replaceProject: (project: ProjectModel, filePath?: string, recovered?: boolean) => void;

  markSaved: (filePath?: string) => void;
};

// Every mutating action goes through mutate(): it snapshots the project
// before the recipe runs, skips the update entirely if nothing changed
// (recipes are free to return the input unchanged as a no-op signal), and
// otherwise pushes the snapshot onto the undo stack and clears redo.
const mutate = (set: (partial: Partial<State>) => void, get: () => State, recipe: (project: ProjectModel) => ProjectModel) => {
  const before = copy(get().project);
  const next = recipe(copy(before));
  if (JSON.stringify(before) === JSON.stringify(next)) return;
  const project = touch(next);
  set({
    project,
    undoStack: [...get().undoStack, before].slice(-MAX_UNDO_ENTRIES),
    redoStack: [],
    dirty: fingerprint(project) !== get().savedFingerprint,
  });
};

export const useProjectStore = create<State>((set, get) => ({
  project: emptyProject(),
  dirty: false,
  undoStack: [],
  redoStack: [],

  select: (selectedNodeId) => set({ selectedNodeId }),
  openDetail: (detailNodeId) => set({ detailNodeId, selectedNodeId: detailNodeId }),
  closeDetail: () => set({ detailNodeId: undefined }),

  applyTemplate: (id) => {
    const project = findTemplate(id).create();
    set({
      project,
      selectedNodeId: project.objects[0]?.id,
      detailNodeId: undefined,
      currentFilePath: undefined,
      savedFingerprint: undefined,
      dirty: true,
      undoStack: [],
      redoStack: [],
    });
  },

  newProject: () => {
    const project = emptyProject();
    set({
      project,
      selectedNodeId: undefined,
      detailNodeId: undefined,
      currentFilePath: undefined,
      savedFingerprint: fingerprint(project),
      dirty: false,
      undoStack: [],
      redoStack: [],
    });
  },

  setActivePage: (id) => {
    if (!get().project.pages.some((page) => page.id === id)) return;
    set({ project: { ...get().project, activePageId: id }, selectedNodeId: undefined, detailNodeId: undefined });
  },

  addPage: (title = 'Yeni Sayfa') =>
    mutate(set, get, (project) => {
      const id = createId('page');
      return { ...project, pages: [...project.pages, { id, title }], activePageId: id };
    }),

  renamePage: (id, title) =>
    mutate(set, get, (project) => ({
      ...project,
      pages: project.pages.map((page) => (page.id === id ? { ...page, title: title.trim() || 'İsimsiz Sayfa' } : page)),
    })),

  deletePage: (id) =>
    mutate(set, get, (project) => {
      if (project.pages.length === 1) return project;
      const pages = project.pages.filter((page) => page.id !== id);
      const nodeIds = new Set(project.objects.filter((node) => node.pageId === id).map((node) => node.id));
      return {
        ...project,
        pages,
        activePageId: project.activePageId === id ? pages[0].id : project.activePageId,
        objects: project.objects.filter((node) => node.pageId !== id),
        placements: project.placements.filter((place) => place.pageId !== id && !nodeIds.has(place.nodeId)),
        relations: project.relations.filter((edge) => edge.pageId !== id && !nodeIds.has(edge.source) && !nodeIds.has(edge.target)),
        playgroundItems: project.playgroundItems.filter((item) => item.pageId !== id),
        groups: project.groups
          .filter((group) => group.pageId !== id)
          .map((group) =>
            group.parentGroupId && !project.groups.some((candidate) => candidate.id === group.parentGroupId && candidate.pageId !== id)
              ? { ...group, parentGroupId: undefined }
              : group,
          ),
      };
    }),

  addNode: (kind) =>
    mutate(set, get, (project) => {
      const object = createObject(kind, project.activePageId);
      const count = project.objects.filter((node) => node.pageId === project.activePageId).length;
      return {
        ...project,
        objects: [...project.objects, object],
        placements: [...project.placements, { nodeId: object.id, pageId: project.activePageId, x: 180 + count * 30, y: 180 + count * 30 }],
      };
    }),

  // Lowest-friction capture path: a teammate types one line (or a short
  // paragraph) with no kind/status/tags decisions to make, and it lands as a
  // quest-kind node on a dedicated "Fikirler" page (auto-created on first
  // use) without switching the active page, so it never interrupts whatever
  // canvas the capturer was already working on. Not meant to be GDD-quality -
  // just meant to not be lost.
  addIdea: (text) =>
    mutate(set, get, (project) => {
      const trimmed = text.trim();
      if (!trimmed) return project;
      const existingPage = project.pages.find((page) => page.title === 'Fikirler');
      const pageId = existingPage?.id ?? createId('page');
      const pages = existingPage ? project.pages : [...project.pages, { id: pageId, title: 'Fikirler' }];
      const title = trimmed.split('\n')[0].slice(0, 80) || 'Yeni fikir';
      const object: GddNode = { ...createObject('quest', pageId, title), tags: ['fikir'], specification: trimmed };
      const count = project.objects.filter((node) => node.pageId === pageId).length;
      return {
        ...project,
        pages,
        objects: [...project.objects, object],
        placements: [...project.placements, { nodeId: object.id, pageId, x: 180 + count * 30, y: 180 + count * 30 }],
      };
    }),

  addNodeAt: (kind, position, sourceId, edgeKind = 'affects') => {
    const object = createObject(kind, get().project.activePageId);
    mutate(set, get, (project) => {
      const source = sourceId && project.objects.find((node) => node.id === sourceId && node.pageId === project.activePageId);
      const relation = source
        ? { id: createId('edge'), pageId: project.activePageId, source: source.id, target: object.id, kind: edgeKind, customLabel: '' }
        : undefined;
      return {
        ...project,
        objects: [...project.objects, object],
        placements: [...project.placements, { nodeId: object.id, pageId: project.activePageId, x: position.x, y: position.y }],
        relations: relation ? [...project.relations, relation] : project.relations,
      };
    });
    set({ selectedNodeId: object.id, detailNodeId: undefined });
  },

  duplicateNode: (id) =>
    mutate(set, get, (project) => {
      const source = project.objects.find((node) => node.id === id);
      if (!source) return project;
      const duplicateId = createId(source.kind);
      const place = project.placements.find((item) => item.nodeId === id);
      const duplicate = {
        ...copy({ ...project, objects: [source] }).objects[0],
        id: duplicateId,
        title: `${source.title} kopyası`,
        checklist: source.checklist.map((item) => ({ ...item, id: createId('check') })),
      };
      return {
        ...project,
        objects: [...project.objects, duplicate],
        placements: [...project.placements, { nodeId: duplicateId, pageId: source.pageId, x: (place?.x ?? 180) + 36, y: (place?.y ?? 180) + 36 }],
      };
    }),

  removeNode: (id) => {
    const { selectedNodeId, detailNodeId } = get();
    mutate(set, get, (project) => ({
      ...project,
      objects: project.objects.filter((node) => node.id !== id),
      placements: project.placements.filter((place) => place.nodeId !== id),
      relations: project.relations.filter((edge) => edge.source !== id && edge.target !== id),
      groups: project.groups.map((group) => ({ ...group, memberNodeIds: group.memberNodeIds.filter((memberId) => memberId !== id) })),
    }));
    if (selectedNodeId === id || detailNodeId === id) {
      set({
        selectedNodeId: selectedNodeId === id ? undefined : selectedNodeId,
        detailNodeId: detailNodeId === id ? undefined : detailNodeId,
      });
    }
  },

  updateNode: (id, patch) =>
    mutate(set, get, (project) => ({
      ...project,
      objects: project.objects.map((object) => (object.id === id ? { ...object, ...patch } : object)),
    })),

  addChecklistItem: (nodeId, text = '') =>
    mutate(set, get, (project) => ({
      ...project,
      objects: project.objects.map((node) =>
        node.id === nodeId ? { ...node, checklist: [...node.checklist, { id: createId('check'), text, done: false }] } : node,
      ),
    })),

  updateChecklistItem: (nodeId, itemId, text) =>
    mutate(set, get, (project) => ({
      ...project,
      objects: project.objects.map((node) =>
        node.id === nodeId
          ? { ...node, checklist: node.checklist.map((item) => (item.id === itemId ? { ...item, text } : item)) }
          : node,
      ),
    })),

  toggleChecklistItem: (nodeId, itemId) =>
    mutate(set, get, (project) => ({
      ...project,
      objects: project.objects.map((node) =>
        node.id === nodeId
          ? { ...node, checklist: node.checklist.map((item) => (item.id === itemId ? { ...item, done: !item.done } : item)) }
          : node,
      ),
    })),

  removeChecklistItem: (nodeId, itemId) =>
    mutate(set, get, (project) => ({
      ...project,
      objects: project.objects.map((node) =>
        node.id === nodeId ? { ...node, checklist: node.checklist.filter((item) => item.id !== itemId) } : node,
      ),
    })),

  moveChecklistItem: (nodeId, itemId, direction) =>
    mutate(set, get, (project) => ({
      ...project,
      objects: project.objects.map((node) => {
        if (node.id !== nodeId) return node;
        const index = node.checklist.findIndex((item) => item.id === itemId);
        const target = index + direction;
        if (index < 0 || target < 0 || target >= node.checklist.length) return node;
        const checklist = [...node.checklist];
        [checklist[index], checklist[target]] = [checklist[target], checklist[index]];
        return { ...node, checklist };
      }),
    })),

  createGroup: (title, color, memberNodeIds) =>
    mutate(set, get, (project) => {
      const pageId = project.activePageId;
      const validMembers = [...new Set(memberNodeIds)].filter((id) => project.objects.some((node) => node.id === id && node.pageId === pageId));
      return {
        ...project,
        groups: [...project.groups, { id: createId('group'), pageId, title: title.trim() || 'Yeni grup', color, memberNodeIds: validMembers, collapsed: false }],
      };
    }),

  updateGroup: (id, patch) =>
    mutate(set, get, (project) => ({
      ...project,
      groups: project.groups.map((group) =>
        group.id === id ? { ...group, ...patch, title: patch.title === undefined ? group.title : patch.title.trim() || 'İsimsiz grup' } : group,
      ),
    })),

  deleteGroup: (id) =>
    mutate(set, get, (project) => ({
      ...project,
      groups: project.groups.filter((group) => group.id !== id).map((group) => (group.parentGroupId === id ? { ...group, parentGroupId: undefined } : group)),
    })),

  addGroupMembers: (id, nodeIds) =>
    mutate(set, get, (project) => ({
      ...project,
      groups: project.groups.map((group) =>
        group.id !== id
          ? group
          : { ...group, memberNodeIds: [...new Set([...group.memberNodeIds, ...nodeIds.filter((nodeId) => project.objects.some((node) => node.id === nodeId && node.pageId === group.pageId))])] },
      ),
    })),

  removeGroupMembers: (id, nodeIds) =>
    mutate(set, get, (project) => {
      const members = new Set(nodeIds);
      return {
        ...project,
        groups: project.groups.map((group) => (group.id === id ? { ...group, memberNodeIds: group.memberNodeIds.filter((nodeId) => !members.has(nodeId)) } : group)),
      };
    }),

  moveGroup: (id, delta) =>
    mutate(set, get, (project) => {
      const group = project.groups.find((candidate) => candidate.id === id);
      if (!group || (!delta.x && !delta.y)) return project;
      const members = new Set(group.memberNodeIds);
      return {
        ...project,
        placements: project.placements.map((place) =>
          place.pageId === group.pageId && members.has(place.nodeId) ? { ...place, x: place.x + delta.x, y: place.y + delta.y } : place,
        ),
      };
    }),

  moveNode: (id, x, y) =>
    mutate(set, get, (project) => ({
      ...project,
      placements: project.placements.map((place) => (place.nodeId === id ? { ...place, x, y } : place)),
    })),

  addPlaygroundItem: (type, text = '', title = '') =>
    mutate(set, get, (project) => ({
      ...project,
      playgroundItems: [
        ...project.playgroundItems,
        { id: createId('playground'), pageId: project.activePageId, type, title, text, x: 36 + project.playgroundItems.length * 18, y: 80 + project.playgroundItems.length * 18 },
      ],
    })),

  addPlaygroundImage: (imageData, caption = '') =>
    mutate(set, get, (project) => ({
      ...project,
      playgroundItems: [
        ...project.playgroundItems,
        { id: createId('playground'), pageId: project.activePageId, type: 'image', title: '', text: caption, imageData, x: 36 + project.playgroundItems.length * 18, y: 80 + project.playgroundItems.length * 18 },
      ],
    })),

  updatePlaygroundItem: (id, patch) =>
    mutate(set, get, (project) => ({
      ...project,
      playgroundItems: project.playgroundItems.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    })),

  movePlaygroundItem: (id, x, y) =>
    mutate(set, get, (project) => ({
      ...project,
      playgroundItems: project.playgroundItems.map((item) => (item.id === id ? { ...item, x, y } : item)),
    })),

  removePlaygroundItem: (id) =>
    mutate(set, get, (project) => ({
      ...project,
      playgroundItems: project.playgroundItems.filter((item) => item.id !== id),
    })),

  addRelation: (source, target, kind) =>
    mutate(set, get, (project) =>
      source === target || project.relations.some((edge) => edge.source === source && edge.target === target && edge.kind === kind)
        ? project
        : { ...project, relations: [...project.relations, { id: createId('edge'), pageId: project.activePageId, source, target, kind, customLabel: '' }] },
    ),

  updateRelation: (id, patch) =>
    mutate(set, get, (project) => ({
      ...project,
      relations: project.relations.map((edge) =>
        edge.id === id ? { ...edge, ...patch, customLabel: (patch.customLabel ?? edge.customLabel).slice(0, MAX_EDGE_LABEL_LENGTH) } : edge,
      ),
    })),

  removeRelation: (id) =>
    mutate(set, get, (project) => ({
      ...project,
      relations: project.relations.filter((edge) => edge.id !== id),
    })),

  undo: () => {
    const { undoStack, project, redoStack, savedFingerprint } = get();
    if (!undoStack.length) return;
    const previous = undoStack.at(-1)!;
    set({
      project: previous,
      selectedNodeId: undefined,
      detailNodeId: undefined,
      undoStack: undoStack.slice(0, -1),
      redoStack: [copy(project), ...redoStack],
      dirty: fingerprint(previous) !== savedFingerprint,
    });
  },

  redo: () => {
    const { redoStack, project, undoStack, savedFingerprint } = get();
    if (!redoStack.length) return;
    const next = redoStack[0];
    set({
      project: next,
      selectedNodeId: undefined,
      detailNodeId: undefined,
      redoStack: redoStack.slice(1),
      undoStack: [...undoStack, copy(project)],
      dirty: fingerprint(next) !== savedFingerprint,
    });
  },

  replaceProject: (project, currentFilePath, recovered = false) =>
    set({
      project: copy(project),
      selectedNodeId: undefined,
      detailNodeId: undefined,
      currentFilePath,
      savedFingerprint: recovered ? undefined : fingerprint(project),
      dirty: recovered,
      undoStack: [],
      redoStack: [],
    }),

  markSaved: (currentFilePath) =>
    set((state) => ({ dirty: false, savedFingerprint: fingerprint(state.project), currentFilePath: currentFilePath ?? state.currentFilePath })),
}));
