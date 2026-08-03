import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';

const { prompt } = vi.hoisted(() => ({ prompt: vi.fn().mockResolvedValue('Renamed') }));
vi.mock('../src/stores/feedbackStore', () => ({ feedback: { prompt, confirm: vi.fn() } }));
vi.mock('../src/stores/uiStore', () => ({ useT: () => (key: string) => key }));
vi.mock('../src/stores/projectStore', () => ({ useProjectStore: (selector: (state: unknown) => unknown) => selector({ project: { pages: [{ id: 'page-1', title: 'Page 1' }, { id: 'page-2', title: 'Page 2' }], activePageId: 'page-1' }, setActivePage: vi.fn(), addPage: vi.fn(), renamePage: vi.fn(), deletePage: vi.fn() }) }));

import { PageTabs } from '../src/components/PageTabs';

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
let root: ReturnType<typeof createRoot> | undefined;
let container: HTMLDivElement | undefined;
afterEach(() => { if (root) act(() => root?.unmount()); container?.remove(); root = undefined; container = undefined; prompt.mockClear(); });

describe('PageTabs rename menu', () => {
  it('exposes rename through a keyboard-focusable overflow summary', async () => {
    container = document.createElement('div'); document.body.append(container); root = createRoot(container);
    act(() => root?.render(<PageTabs />));
    const summary = container.querySelector('summary[aria-label="pageTabs.renamePage"]') as HTMLElement;
    expect(summary).toBeTruthy();
    expect(summary.tabIndex).toBeGreaterThanOrEqual(0);
    const renameButton = container.querySelector('summary + .menu-popover button') as HTMLButtonElement;
    await act(async () => renameButton.click());
    expect(prompt).toHaveBeenCalledOnce();
  });
});
