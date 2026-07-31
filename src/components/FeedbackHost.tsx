import { useEffect, useRef, useState } from 'react';
import { useFeedbackStore, type FeedbackToast } from '../stores/feedbackStore';

function Toast({ toast }: { toast: FeedbackToast }) {
  const dismiss = useFeedbackStore((state) => state.dismissToast);
  useEffect(() => {
    const timer = window.setTimeout(() => dismiss(toast.id), toast.tone === 'error' ? 6000 : 3600);
    return () => window.clearTimeout(timer);
  }, [dismiss, toast]);

  return (
    <div className={`feedback-toast ${toast.tone}`} role={toast.tone === 'error' ? 'alert' : 'status'}>
      <span>{toast.message}</span>
      <button aria-label="Bildirimi kapat" onClick={() => dismiss(toast.id)}>×</button>
    </div>
  );
}

export function FeedbackHost() {
  const dialog = useFeedbackStore((state) => state.active);
  const settle = useFeedbackStore((state) => state.settle);
  const toasts = useFeedbackStore((state) => state.toasts);
  const panelRef = useRef<HTMLElement>(null);
  const restoreRef = useRef<HTMLElement | null>(null);
  const [input, setInput] = useState('');

  useEffect(() => {
    if (!dialog) return;
    restoreRef.current = document.activeElement as HTMLElement | null;
    setInput(dialog.type === 'prompt' ? dialog.initialValue : '');
    const timer = window.setTimeout(() => {
      const selector = dialog.type === 'prompt' ? 'input' : '[data-safe-focus]';
      panelRef.current?.querySelector<HTMLElement>(selector)?.focus();
    });
    return () => {
      window.clearTimeout(timer);
      restoreRef.current?.focus();
    };
  }, [dialog]);

  useEffect(() => {
    if (!dialog) return;
    const keys = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        settle(dialog.type === 'confirm' ? false : null);
        return;
      }
      if (event.key !== 'Tab') return;
      const focusable = [...(panelRef.current?.querySelectorAll<HTMLElement>(
        'button:not(:disabled),input:not(:disabled),select:not(:disabled),textarea:not(:disabled),[tabindex]:not([tabindex="-1"])',
      ) ?? [])];
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable.at(-1)!;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener('keydown', keys);
    return () => window.removeEventListener('keydown', keys);
  }, [dialog, settle]);

  return (
    <>
      {dialog && (
        <div className="feedback-backdrop">
          <section
            ref={panelRef}
            className={`feedback-dialog ${dialog.type === 'confirm' ? dialog.tone : ''}`}
            role={dialog.type === 'confirm' && dialog.tone === 'danger' ? 'alertdialog' : 'dialog'}
            aria-modal="true"
            aria-labelledby="feedback-title"
            aria-describedby={dialog.message ? 'feedback-message' : undefined}
          >
            <h2 id="feedback-title">{dialog.title}</h2>
            {dialog.message && <p id="feedback-message">{dialog.message}</p>}
            {dialog.type === 'prompt' && (
              <label>
                {dialog.inputLabel}
                <input
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' && !event.nativeEvent.isComposing) settle(input);
                  }}
                />
              </label>
            )}
            <div className="feedback-actions">
              <button data-safe-focus onClick={() => settle(dialog.type === 'confirm' ? false : null)}>
                {dialog.cancelLabel}
              </button>
              {dialog.type === 'choice' ? dialog.choices.map((choice) => (
                <button
                  key={choice.value}
                  className={choice.tone === 'danger' ? 'danger' : 'primary'}
                  onClick={() => settle(choice.value)}
                >
                  {choice.label}
                </button>
              )) : (
                <button
                  className={dialog.type === 'confirm' && dialog.tone === 'danger' ? 'danger' : 'primary'}
                  onClick={() => settle(dialog.type === 'confirm' ? true : input)}
                >
                  {dialog.confirmLabel}
                </button>
              )}
            </div>
          </section>
        </div>
      )}
      <div className="toast-region" aria-label="Bildirimler">
        {toasts.map((toast) => <Toast key={toast.id} toast={toast} />)}
      </div>
    </>
  );
}
