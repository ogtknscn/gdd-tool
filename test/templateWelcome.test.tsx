import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { TemplateWelcome } from '../src/components/TemplateWelcome';

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
let root: ReturnType<typeof createRoot> | undefined; let container: HTMLDivElement | undefined;
afterEach(() => { if (root) act(() => root?.unmount()); container?.remove(); root = undefined; container = undefined; });
const renderWelcome = (required: boolean) => { const onChoose = vi.fn(); const onClose = vi.fn(); container = document.createElement('div'); document.body.append(container); root = createRoot(container); act(() => root?.render(<TemplateWelcome required={required} onChoose={onChoose} onClose={onClose} />)); return { onChoose, onClose }; };
describe('TemplateWelcome', () => {
  it('keeps the first-run welcome mandatory while still allowing a template choice', () => { const { onChoose } = renderWelcome(true); expect(container?.querySelector('[aria-label="Şablonları kapat"]')).toBeNull(); const puzzle = [...container!.querySelectorAll('button')].find((button) => button.textContent?.includes('Puzzle level design'))!; act(() => puzzle.click()); expect(onChoose).toHaveBeenCalledWith('puzzle-level'); });
  it('allows optional template browsing to close without selecting', () => { const { onClose } = renderWelcome(false); const close = container?.querySelector<HTMLButtonElement>('[aria-label="Şablonları kapat"]')!; act(() => close.click()); expect(onClose).toHaveBeenCalledOnce(); });
});
