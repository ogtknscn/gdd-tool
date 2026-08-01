import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CommitFieldInput } from '../src/components/CommitFieldInput';

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
let root: ReturnType<typeof createRoot> | undefined;
let container: HTMLDivElement | undefined;
afterEach(() => { if (root) act(() => root?.unmount()); container?.remove(); root = undefined; container = undefined; });

const renderField = (value: string, onCommit: (value: string) => void, multiline = false) => {
  container = document.createElement('div'); document.body.append(container); root = createRoot(container);
  act(() => root?.render(<CommitFieldInput value={value} onCommit={onCommit} multiline={multiline} />));
  const field = container.querySelector(multiline ? 'textarea' : 'input')! as HTMLInputElement | HTMLTextAreaElement;
  const prototype = multiline ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
  const type = (value: string) => act(() => { Object.getOwnPropertyDescriptor(prototype, 'value')?.set?.call(field, value); field.dispatchEvent(new Event('input', { bubbles: true })); });
  return { field, type };
};

describe('CommitFieldInput interaction', () => {
  it('does not call onCommit while typing, only once on blur', () => {
    const commit = vi.fn(); const { field, type } = renderField('Eski özet', commit);
    type('Yeni'); type('Yeni özet'); expect(commit).not.toHaveBeenCalled();
    act(() => field.dispatchEvent(new FocusEvent('focusout', { bubbles: true })));
    expect(commit).toHaveBeenCalledOnce(); expect(commit).toHaveBeenCalledWith('Yeni özet');
  });
  it('does not commit on blur when the value is unchanged', () => {
    const commit = vi.fn(); const { field } = renderField('Aynı metin', commit);
    act(() => field.dispatchEvent(new FocusEvent('focusout', { bubbles: true })));
    expect(commit).not.toHaveBeenCalled();
  });
  it('cancels with Escape and restores the previous value without committing', () => {
    const commit = vi.fn(); const { field, type } = renderField('Eski', commit, true);
    field.focus(); type('Geçici');
    act(() => field.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })));
    expect(commit).not.toHaveBeenCalled(); expect(field.value).toBe('Eski');
  });
});
