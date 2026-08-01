import { useEffect, useRef, useState, type ChangeEvent, type KeyboardEvent } from 'react';

type Props = { value: string; onCommit: (value: string) => void; placeholder?: string; className?: string; multiline?: boolean; 'aria-label'?: string };

/**
 * Keeps transient typing local so a long field commits once per edit instead
 * of once per keystroke - every commit runs mutate()'s full deep-clone +
 * undo-push, so typing a 500-character specification directly into the
 * project store used to mean 500 full-project snapshots kept in memory and
 * an undo stack that could only ever undo one character at a time.
 */
export function CommitFieldInput({ value, onCommit, placeholder, className, multiline, 'aria-label': ariaLabel }: Props) {
  const [draft, setDraft] = useState(value);
  const cancelled = useRef(false);
  useEffect(() => setDraft(value), [value]);
  const commit = () => {
    if (cancelled.current) { cancelled.current = false; setDraft(value); return; }
    if (draft !== value) onCommit(draft);
  };
  const onChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setDraft(event.target.value);
  const onKeyDown = (event: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (event.key === 'Escape') { event.preventDefault(); cancelled.current = true; event.currentTarget.blur(); }
  };
  if (multiline) return <textarea className={className} aria-label={ariaLabel} value={draft} placeholder={placeholder} onChange={onChange} onBlur={commit} onKeyDown={onKeyDown} />;
  return <input className={className} aria-label={ariaLabel} value={draft} placeholder={placeholder} onChange={onChange} onBlur={commit} onKeyDown={onKeyDown} />;
}
