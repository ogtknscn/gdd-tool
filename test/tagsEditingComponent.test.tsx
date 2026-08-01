import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CommitTagsInput, parseTagsInput } from '../src/components/CommitTagsInput';

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
let root: ReturnType<typeof createRoot> | undefined;
let container: HTMLDivElement | undefined;
afterEach(() => { if (root) act(() => root?.unmount()); container?.remove(); root = undefined; container = undefined; });

const renderInput = (value: string[], onCommit: (tags: string[]) => void) => {
  container = document.createElement('div'); document.body.append(container); root = createRoot(container);
  act(() => root?.render(<CommitTagsInput value={value} onCommit={onCommit} />));
  const input = container.querySelector('input')!;
  const type = (value: string) => act(() => { Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set?.call(input, value); input.dispatchEvent(new Event('input', { bubbles: true })); });
  return { input, type };
};

describe('parseTagsInput', () => {
  it('splits on commas, trims whitespace, and drops empties', () => {
    expect(parseTagsInput('savaş, ekonomi ,, onboarding')).toEqual(['savaş', 'ekonomi', 'onboarding']);
  });
});

describe('CommitTagsInput interaction', () => {
  it('does not lose a comma typed mid-edit before blur', () => {
    const commit = vi.fn(); const { input, type } = renderInput([], commit);
    type('savas'); type('savas,'); type('savas, e');
    expect(input.value).toBe('savas, e'); expect(commit).not.toHaveBeenCalled();
  });
  it('commits parsed tags once on blur', () => {
    const commit = vi.fn(); const { input, type } = renderInput([], commit); type('savaş, ekonomi');
    act(() => input.dispatchEvent(new FocusEvent('focusout', { bubbles: true })));
    expect(commit).toHaveBeenCalledOnce(); expect(commit).toHaveBeenCalledWith(['savaş', 'ekonomi']);
  });
  it('cancels with Escape and restores the previous tags', () => {
    const commit = vi.fn(); const { input, type } = renderInput(['eski'], commit); input.focus(); type('yeni etiket');
    act(() => input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })));
    expect(commit).not.toHaveBeenCalled(); expect(input.value).toBe('eski');
  });
});
