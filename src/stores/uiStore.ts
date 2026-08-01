import { useCallback } from 'react';
import { create } from 'zustand';
import { t, type Language } from '../domain/i18n';
import type { EdgeKind, NodeKind, NodeStatus } from '../domain/types';

const LANGUAGE_STORAGE_KEY = 'gdd-tool:language';
const initialLanguage = (): Language => (localStorage.getItem(LANGUAGE_STORAGE_KEY) === 'en' ? 'en' : 'tr');

export type CardDensity = 'auto' | 'compact' | 'standard' | 'detailed';
export type QuickAddState = { position: { x: number; y: number }; sourceId?: string; edgeKind: EdgeKind };
export type NodeFilter = { query: string; kinds: NodeKind[]; statuses: NodeStatus[]; tags: string[]; focusMode: boolean; filterOpen: boolean };
type UiState = {
  outlineOpen: boolean; inspectorOpen: boolean; validationOpen: boolean; paletteOpen: boolean; shortcutsOpen: boolean; playgroundOpen: boolean; markdownPreviewOpen: boolean; readinessView: boolean; language: Language;
  cardDensity: CardDensity; canvasZoom: number; edgeKind: EdgeKind; connectionSourceId?: string; selectedRelationId?: string; quickAdd?: QuickAddState; nodeFilter: NodeFilter; focusedGroupId?: string;
  toggleOutline: () => void; toggleInspector: () => void; toggleValidation: () => void; togglePlayground: () => void; setPlaygroundOpen: (open: boolean) => void; toggleMarkdownPreview: () => void; toggleReadinessView: () => void; setLanguage: (language: Language) => void;
  setPaletteOpen: (open: boolean) => void; setShortcutsOpen: (open: boolean) => void; setCardDensity: (density: CardDensity) => void;
  setCanvasZoom: (zoom: number) => void; setEdgeKind: (kind: EdgeKind) => void; beginConnection: (nodeId: string) => void; cancelConnection: () => void; setSelectedRelation: (id?: string) => void; openQuickAdd: (position: QuickAddState['position'], sourceId?: string, edgeKind?: EdgeKind) => void; closeQuickAdd: () => void; setNodeFilter: (patch: Partial<NodeFilter>) => void; setFocusedGroup: (id?: string) => void;
};
export const useUiStore = create<UiState>((set) => ({
  outlineOpen: true, inspectorOpen: true, validationOpen: false, paletteOpen: false, shortcutsOpen: false, playgroundOpen: false, markdownPreviewOpen: false, readinessView: false, language: initialLanguage(),
  cardDensity: 'auto', canvasZoom: 1, edgeKind: 'affects', nodeFilter: { query: '', kinds: [], statuses: [], tags: [], focusMode: false, filterOpen: false },
  toggleOutline: () => set((state) => ({ outlineOpen: !state.outlineOpen })), toggleInspector: () => set((state) => ({ inspectorOpen: !state.inspectorOpen })), toggleValidation: () => set((state) => ({ validationOpen: !state.validationOpen })), togglePlayground: () => set((state) => ({ playgroundOpen: !state.playgroundOpen })), setPlaygroundOpen: (playgroundOpen) => set({ playgroundOpen }), toggleMarkdownPreview: () => set((state) => ({ markdownPreviewOpen: !state.markdownPreviewOpen })), toggleReadinessView: () => set((state) => ({ readinessView: !state.readinessView })),
  setLanguage: (language) => { localStorage.setItem(LANGUAGE_STORAGE_KEY, language); set({ language }); },
  setPaletteOpen: (paletteOpen) => set({ paletteOpen }), setShortcutsOpen: (shortcutsOpen) => set({ shortcutsOpen }), setCardDensity: (cardDensity) => set({ cardDensity }),
  setCanvasZoom: (canvasZoom) => set({ canvasZoom }), setEdgeKind: (edgeKind) => set({ edgeKind }), beginConnection: (connectionSourceId) => set({ connectionSourceId, selectedRelationId: undefined }), cancelConnection: () => set({ connectionSourceId: undefined }), setSelectedRelation: (selectedRelationId) => set({ selectedRelationId, connectionSourceId: undefined }), openQuickAdd: (position, sourceId, edgeKind) => set((state) => ({ quickAdd: { position, sourceId, edgeKind: edgeKind ?? state.edgeKind }, connectionSourceId: undefined, selectedRelationId: undefined })), closeQuickAdd: () => set({ quickAdd: undefined }), setNodeFilter: (patch) => set((state) => ({ nodeFilter: { ...state.nodeFilter, ...patch } })), setFocusedGroup: (focusedGroupId) => set({ focusedGroupId }),
}));

// Translation hook co-located with the language state to avoid a circular
// import between uiStore.ts and i18n.ts (i18n.ts stays a plain data/helper
// module with no store dependency).
export function useT() {
  const language = useUiStore((state) => state.language);
  return useCallback((key: string, vars?: Record<string, string | number>) => t(language, key, vars), [language]);
}
