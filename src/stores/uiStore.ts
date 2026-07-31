import { create } from 'zustand';
import type { EdgeKind } from '../domain/types';

export type CardDensity = 'auto' | 'compact' | 'standard' | 'detailed';
type UiState = {
  outlineOpen: boolean; inspectorOpen: boolean; validationOpen: boolean; paletteOpen: boolean; shortcutsOpen: boolean;
  cardDensity: CardDensity; canvasZoom: number; edgeKind: EdgeKind; connectionSourceId?: string; selectedRelationId?: string;
  toggleOutline: () => void; toggleInspector: () => void; toggleValidation: () => void;
  setPaletteOpen: (open: boolean) => void; setShortcutsOpen: (open: boolean) => void; setCardDensity: (density: CardDensity) => void;
  setCanvasZoom: (zoom: number) => void; setEdgeKind: (kind: EdgeKind) => void; beginConnection: (nodeId: string) => void; cancelConnection: () => void; setSelectedRelation: (id?: string) => void;
};
export const useUiStore = create<UiState>((set) => ({
  outlineOpen: true, inspectorOpen: true, validationOpen: false, paletteOpen: false, shortcutsOpen: false,
  cardDensity: 'auto', canvasZoom: 1, edgeKind: 'affects',
  toggleOutline: () => set((state) => ({ outlineOpen: !state.outlineOpen })), toggleInspector: () => set((state) => ({ inspectorOpen: !state.inspectorOpen })), toggleValidation: () => set((state) => ({ validationOpen: !state.validationOpen })),
  setPaletteOpen: (paletteOpen) => set({ paletteOpen }), setShortcutsOpen: (shortcutsOpen) => set({ shortcutsOpen }), setCardDensity: (cardDensity) => set({ cardDensity }),
  setCanvasZoom: (canvasZoom) => set({ canvasZoom }), setEdgeKind: (edgeKind) => set({ edgeKind }), beginConnection: (connectionSourceId) => set({ connectionSourceId, selectedRelationId: undefined }), cancelConnection: () => set({ connectionSourceId: undefined }), setSelectedRelation: (selectedRelationId) => set({ selectedRelationId, connectionSourceId: undefined }),
}));
