import { beforeEach, describe, expect, it } from 'vitest';
import { APP_COMMANDS } from '../src/commands/appCommands';
import { useUiStore } from '../src/stores/uiStore';
describe('workspace UI state', () => {
  beforeEach(() => useUiStore.setState({ outlineOpen: true, inspectorOpen: true, validationOpen: false, paletteOpen: false, shortcutsOpen: false, cardDensity: 'auto', canvasZoom: 1, edgeKind: 'affects', connectionSourceId: undefined }));
  it('keeps transient controls independent and cancellable', () => { const store = useUiStore.getState(); store.toggleOutline(); store.toggleValidation(); store.beginConnection('node-1'); store.setCardDensity('detailed'); expect(useUiStore.getState()).toMatchObject({ outlineOpen: false, validationOpen: true, connectionSourceId: 'node-1', cardDensity: 'detailed' }); store.cancelConnection(); expect(useUiStore.getState().connectionSourceId).toBeUndefined(); });
  it('defines unique centralized commands', () => { expect(new Set(APP_COMMANDS.map((command) => command.id)).size).toBe(APP_COMMANDS.length); expect(APP_COMMANDS.find((command) => command.id === 'save')?.shortcut).toBe('Ctrl+S'); });
});
