import { create } from 'zustand';
import type { EdgeKind, NodeKind, NodeStatus } from '../domain/types';

export type CardDensity = 'auto' | 'compact' | 'standard' | 'detailed';
export type QuickAddState = { position: { x: number; y: number }; sourceId?: string; edgeKind: EdgeKind };
export type NodeFilter = { query: string; kinds: NodeKind[]; statuses: NodeStatus[]; tags: string[]; focusMode: boolean; filterOpen: boolean };
type UiState = {
  outlineOpen: boolean; inspectorOpen: boolean; validationOpen: boolean; paletteOpen: boolean; shortcutsOpen: boolean; playgroundOpen: boolean;
  cardDensity: CardDensity; canvasZoom: number; edgeKind: EdgeKind; connectionSourceId?: string; selectedRelationId?: string; quickAdd?: QuickAddState; nodeFilter: NodeFilter; focusedGroupId?: string;
  toggleOutline: () => void; toggleInspector: () => void; toggleValidation: () => void; togglePlayground: () => void;
  setPaletteOpen: (open: boolean) => void; setShortcutsOpen: (open: boolean) => void; setCardDensity: (density: CardDensity) => void;
  setCanvasZoom: (zoom: number) => void; setEdgeKind: (kind: EdgeKind) => void; beginConnection: (nodeId: string) => void; cancelConnection: () => void; setSelectedRelation: (id?: string) => void; openQuickAdd: (position: QuickAddState['position'], sourceId?: string, edgeKind?: EdgeKind) => void; closeQuickAdd: () => void; setNodeFilter: (patch: Partial<NodeFilter>) => void; setFocusedGroup: (id?: string) => void;
};
export const useUiStore = create<UiState>((set) => ({
  outlineOpen: true, inspectorOpen: true, validationOpen: false, paletteOpen: false, shortcutsOpen: false, playgroundOpen: false,
  cardDensity: 'auto', canvasZoom: 1, edgeKind: 'affects', nodeFilter: { query: '', kinds: [], statuses: [], tags: [], focusMode: false, filterOpen: false },
  toggleOutline: () => set((state) => ({ outlineOpen: !state.outlineOpen })), toggleInspector: () => set((state) => ({ inspectorOpen: !state.inspectorOpen })), toggleValidation: () => set((state) => ({ validationOpen: !state.validationOpen })), togglePlayground: () => set((state) => ({ playgroundOpen: !state.playgroundOpen })),
  setPaletteOpen: (paletteOpen) => set({ paletteOpen }), setShortcutsOpen: (shortcutsOpen) => set({ shortcutsOpen }), setCardDensity: (cardDensity) => set({ cardDensity }),
  setCanvasZoom: (canvasZoom) => set({ canvasZoom }), setEdgeKind: (edgeKind) => set({ edgeKind }), beginConnection: (connectionSourceId) => set({ connectionSourceId, selectedRelationId: undefined }), cancelConnection: () => set({ connectionSourceId: undefined }), setSelectedRelation: (selectedRelationId) => set({ selectedRelationId, connectionSourceId: undefined }), openQuickAdd: (position, sourceId, edgeKind) => set((state) => ({ quickAdd: { position, sourceId, edgeKind: edgeKind ?? state.edgeKind }, connectionSourceId: undefined, selectedRelationId: undefined })), closeQuickAdd: () => set({ quickAdd: undefined }), setNodeFilter: (patch) => set((state) => ({ nodeFilter: { ...state.nodeFilter, ...patch } })), setFocusedGroup: (focusedGroupId) => set({ focusedGroupId }),
}));
