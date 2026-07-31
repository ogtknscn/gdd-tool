import { useEffect, useMemo, useRef, useState } from 'react';
import { NODE_LABELS, nodeKinds, type NodeKind } from '../domain/types';
import { useProjectStore } from '../stores/projectStore';
import { useUiStore } from '../stores/uiStore';

export function NodeQuickAdd() {
  const quickAdd = useUiStore((state) => state.quickAdd); const closeQuickAdd = useUiStore((state) => state.closeQuickAdd);
  const addNodeAt = useProjectStore((state) => state.addNodeAt); const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState(''); const [activeIndex, setActiveIndex] = useState(0);
  const options = useMemo(() => nodeKinds.filter((kind) => NODE_LABELS[kind].toLocaleLowerCase('tr').includes(query.toLocaleLowerCase('tr'))), [query]);
  useEffect(() => { if (quickAdd) { setQuery(''); setActiveIndex(0); window.setTimeout(() => inputRef.current?.focus()); } }, [quickAdd]);
  useEffect(() => setActiveIndex(0), [query]);
  if (!quickAdd) return null;
  const pick = (kind: NodeKind) => { addNodeAt(kind, quickAdd.position, quickAdd.sourceId, quickAdd.edgeKind); closeQuickAdd(); };
  return <div className="quick-add-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) closeQuickAdd(); }}>
    <section className="node-quick-add" role="dialog" aria-modal="true" aria-label="Hızlı öğe ekle">
      <span className="eyebrow">Tuvale ekle</span><input ref={inputRef} value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => { if (event.key === 'Escape') { event.preventDefault(); closeQuickAdd(); } else if (event.key === 'ArrowDown' && options.length) { event.preventDefault(); setActiveIndex((index) => (index + 1) % options.length); } else if (event.key === 'ArrowUp' && options.length) { event.preventDefault(); setActiveIndex((index) => (index - 1 + options.length) % options.length); } else if (event.key === 'Enter' && options[activeIndex]) { event.preventDefault(); pick(options[activeIndex]); } }} placeholder="Öğe türü ara…" aria-label="Öğe türü ara" aria-controls="quick-add-results" aria-activedescendant={options[activeIndex] ? `quick-add-${options[activeIndex]}` : undefined} />
      <div id="quick-add-results" role="listbox">{options.map((kind, index) => <button id={`quick-add-${kind}`} key={kind} role="option" aria-selected={index === activeIndex} className={index === activeIndex ? 'active' : ''} onMouseEnter={() => setActiveIndex(index)} onClick={() => pick(kind)}><span>{NODE_LABELS[kind]}</span><small>{kind}</small></button>)}{!options.length && <p>Öğe türü bulunamadı.</p>}</div>
    </section>
  </div>;
}
