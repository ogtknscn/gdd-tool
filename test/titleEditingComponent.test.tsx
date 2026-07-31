import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CommitTitleInput } from '../src/components/CommitTitleInput';

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
let root: ReturnType<typeof createRoot> | undefined;
let container: HTMLDivElement | undefined;
afterEach(() => { if (root) act(() => root?.unmount()); container?.remove(); root = undefined; container = undefined; });

const renderInput = (onCommit: (value: string) => void) => {
  container = document.createElement('div'); document.body.append(container); root = createRoot(container);
  act(() => root?.render(<CommitTitleInput value="Eski başlık" onCommit={onCommit} />));
  const input = container.querySelector('input')!;
  const type = (value: string) => act(() => { Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set?.call(input, value); input.dispatchEvent(new Event('input', { bubbles: true })); });
  return { input, type };
};

describe('CommitTitleInput interaction', () => {
  it('allows an empty draft and commits its fallback once on blur', () => {
    const commit = vi.fn(); const { input, type } = renderInput(commit); type('   ');
    act(() => input.dispatchEvent(new FocusEvent('focusout', { bubbles: true })));
    expect(commit).toHaveBeenCalledOnce(); expect(commit).toHaveBeenCalledWith('İsimsiz öğe');
  });
  it('cancels with Escape and ignores Enter during IME composition', () => {
    const commit = vi.fn(); const { input, type } = renderInput(commit); input.focus(); type('Geçici başlık');
    act(() => input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', isComposing: true, bubbles: true })));
    expect(commit).not.toHaveBeenCalled();
    act(() => input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })));
    expect(commit).not.toHaveBeenCalled(); expect(input.value).toBe('Eski başlık');
  });
});
