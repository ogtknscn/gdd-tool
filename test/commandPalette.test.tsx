import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CommandPalette } from '../src/components/CommandPalette';
import { useUiStore } from '../src/stores/uiStore';

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

let root: ReturnType<typeof createRoot> | undefined;
let container: HTMLDivElement | undefined;

afterEach(() => {
  if (root) act(() => root?.unmount());
  container?.remove();
  root = undefined;
  container = undefined;
  useUiStore.setState({ paletteOpen: false });
});

describe('CommandPalette', () => {
  it('lists creation commands and runs the keyboard-selected command', () => {
    const run = vi.fn();
    container = document.createElement('div');
    document.body.append(container);
    root = createRoot(container);

    act(() => {
      useUiStore.setState({ paletteOpen: true });
      root?.render(<CommandPalette run={run} />);
    });

    expect(container.textContent).toContain('Mekanik ekle');
    const input = container.querySelector('input')!;
    act(() => input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true })));
    act(() => input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })));

    expect(run).toHaveBeenCalledOnce();
    expect(run).toHaveBeenCalledWith('open');
    expect(useUiStore.getState().paletteOpen).toBe(false);
  });
});
