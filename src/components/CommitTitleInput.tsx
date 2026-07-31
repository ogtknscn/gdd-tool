import { useEffect, useRef, useState, type KeyboardEvent } from 'react';

export const normalizeCommittedTitle = (value: string) => value.trim() || 'İsimsiz öğe';
export const titleKeyAction = (key: string, isComposing: boolean): 'none' | 'commit' | 'cancel' => {
  if (isComposing) return 'none';
  if (key === 'Enter') return 'commit';
  if (key === 'Escape') return 'cancel';
  return 'none';
};

type Props = { value: string; onCommit: (value: string) => void; className?: string; 'aria-label'?: string };

/** Keeps transient typing local so one finished edit creates exactly one project mutation. */
export function CommitTitleInput({ value, onCommit, className, 'aria-label': ariaLabel }: Props) {
  const [draft, setDraft] = useState(value); const cancelled = useRef(false);
  useEffect(() => setDraft(value), [value]);
  const commit = () => {
    if (cancelled.current) { cancelled.current = false; setDraft(value); return; }
    const normalized = normalizeCommittedTitle(draft); setDraft(normalized);
    if (normalized !== value) onCommit(normalized);
  };
  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    const action = titleKeyAction(event.key, event.nativeEvent.isComposing);
    if (action === 'none') return;
    event.preventDefault();
    if (action === 'cancel') { cancelled.current = true; setDraft(value); }
    event.currentTarget.blur();
  };
  return <input className={className} aria-label={ariaLabel} value={draft} onChange={(event) => setDraft(event.target.value)} onBlur={commit} onKeyDown={onKeyDown} />;
}
