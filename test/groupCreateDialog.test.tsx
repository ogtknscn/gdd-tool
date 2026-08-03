import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createObject } from '../src/domain/project';
import { GroupCreateDialog } from '../src/components/GroupCreateDialog';

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
let root: ReturnType<typeof createRoot> | undefined; let container: HTMLDivElement | undefined;
afterEach(() => { if (root) act(() => root?.unmount()); container?.remove(); root = undefined; container = undefined; });

describe('GroupCreateDialog', () => {
  it('starts with the React Flow-selected cards only, while preserving checkbox editing', () => {
    const first = { ...createObject('mechanic', 'page-1'), id: 'first', title: 'First' }; const second = { ...createObject('quest', 'page-1'), id: 'second', title: 'Second' }; const onCreate = vi.fn();
    container = document.createElement('div'); document.body.append(container); root = createRoot(container);
    act(() => root?.render(<GroupCreateDialog nodes={[first, second]} selectedMemberIds={['second']} onCreate={onCreate} onClose={vi.fn()} />));
    const boxes = container.querySelectorAll<HTMLInputElement>('input[type=checkbox]');
    expect([...boxes].map((box) => box.checked)).toEqual([false, true]);
    act(() => boxes[0].click());
    expect([...boxes].map((box) => box.checked)).toEqual([true, true]);
  });
});
