import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { MAX_EDGE_LABEL_LENGTH } from '../domain/types';

type Props = { value: string; placeholder: string; onCommit: (value: string) => void; className?: string; 'aria-label': string };

/** Keeps relation text transient so one completed edit becomes one undoable mutation. */
export function CommitRelationLabelInput({ value, placeholder, onCommit, className, 'aria-label': ariaLabel }: Props) {
  const [draft, setDraft] = useState(value); const cancelled = useRef(false);
  useEffect(() => setDraft(value), [value]);
  const commit = () => {
    if (cancelled.current) { cancelled.current = false; setDraft(value); return; }
    const next = draft.slice(0, MAX_EDGE_LABEL_LENGTH);
    setDraft(next);
    if (next !== value) onCommit(next);
  };
  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.nativeEvent.isComposing || !['Enter', 'Escape'].includes(event.key)) return;
    event.preventDefault();
    if (event.key === 'Escape') { cancelled.current = true; setDraft(value); }
    event.currentTarget.blur();
  };
  return <input className={className} aria-label={ariaLabel} maxLength={MAX_EDGE_LABEL_LENGTH} value={draft} placeholder={placeholder} onChange={(event) => setDraft(event.target.value)} onBlur={commit} onKeyDown={onKeyDown} />;
}
