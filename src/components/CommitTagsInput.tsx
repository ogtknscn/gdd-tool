import { useEffect, useRef, useState, type KeyboardEvent } from 'react';

export const parseTagsInput = (value: string): string[] => value.split(',').map((tag) => tag.trim()).filter(Boolean);

type Props = { value: string[]; onCommit: (tags: string[]) => void; placeholder?: string; 'aria-label'?: string };

/** Keeps transient typing local so a comma mid-edit isn't swallowed by an immediate parse/round-trip. */
export function CommitTagsInput({ value, onCommit, placeholder, 'aria-label': ariaLabel }: Props) {
  const [draft, setDraft] = useState(value.join(', '));
  const cancelled = useRef(false);
  useEffect(() => setDraft(value.join(', ')), [value]);
  const commit = () => {
    if (cancelled.current) { cancelled.current = false; setDraft(value.join(', ')); return; }
    onCommit(parseTagsInput(draft));
  };
  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.nativeEvent.isComposing) return;
    if (event.key === 'Enter') { event.preventDefault(); event.currentTarget.blur(); }
    else if (event.key === 'Escape') { event.preventDefault(); cancelled.current = true; event.currentTarget.blur(); }
  };
  return <input aria-label={ariaLabel} value={draft} placeholder={placeholder} onChange={(event) => setDraft(event.target.value)} onBlur={commit} onKeyDown={onKeyDown} />;
}
