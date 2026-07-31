import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CommitRelationLabelInput } from '../src/components/CommitRelationLabelInput';

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
let root: ReturnType<typeof createRoot> | undefined;
let container: HTMLDivElement | undefined;
afterEach(() => { if (root) act(() => root?.unmount()); container?.remove(); root = undefined; container = undefined; });

const renderInput = (onCommit: (value: string) => void) => {
  container = document.createElement('div'); document.body.append(container); root = createRoot(container);
  act(() => root?.render(<CommitRelationLabelInput aria-label="Bağlantı açıklaması" value="Etkiler" placeholder="Etkiler" onCommit={onCommit} />));
  const input = container.querySelector('input')!;
  const type = (value: string) => act(() => { Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set?.call(input, value); input.dispatchEvent(new Event('input', { bubbles: true })); });
  return { input, type };
};

describe('CommitRelationLabelInput interaction', () => {
  it('keeps typing local and commits exactly once on blur', () => {
    const commit = vi.fn(); const { input, type } = renderInput(commit); type('Oyuncu güvenini azaltır');
    expect(commit).not.toHaveBeenCalled();
    act(() => input.dispatchEvent(new FocusEvent('focusout', { bubbles: true })));
    expect(commit).toHaveBeenCalledOnce(); expect(commit).toHaveBeenCalledWith('Oyuncu güvenini azaltır');
  });
  it('commits once on Enter and cancels the draft with Escape', () => {
    const commit = vi.fn(); const { input, type } = renderInput(commit); input.focus(); type('Yeni açıklama');
    act(() => input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })));
    expect(commit).toHaveBeenCalledOnce(); expect(commit).toHaveBeenCalledWith('Yeni açıklama');
    input.focus(); type('İptal edilen');
    act(() => input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })));
    expect(commit).toHaveBeenCalledOnce(); expect(input.value).toBe('Etkiler');
  });
});
