import { useEffect, useRef, useState } from 'react';
import { GROUP_COLORS } from '../domain/groups';
import type { GddNode } from '../domain/types';

type Props = { nodes: GddNode[]; onCreate: (title: string, color: string, memberIds: string[]) => void; onClose: () => void };
export function GroupCreateDialog({ nodes, onCreate, onClose }: Props) {
  const [title, setTitle] = useState('Yeni grup'); const [color, setColor] = useState<string>(GROUP_COLORS[0]); const [members, setMembers] = useState(() => new Set(nodes.map((node) => node.id))); const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { window.setTimeout(() => inputRef.current?.focus()); }, []);
  const toggle = (id: string) => setMembers((current) => { const next = new Set(current); if (next.has(id)) next.delete(id); else next.add(id); return next; });
  return <div className="group-dialog-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><section className="group-dialog" role="dialog" aria-modal="true" aria-labelledby="group-dialog-title"><h2 id="group-dialog-title">Grup oluştur</h2><p>Grup kartları silmez; yalnızca tuvalde birlikte düzenlemeyi kolaylaştırır.</p><label>Grup adı<input ref={inputRef} value={title} onChange={(event) => setTitle(event.target.value)} onKeyDown={(event) => { if (event.key === 'Escape') onClose(); if (event.key === 'Enter' && !event.nativeEvent.isComposing) onCreate(title, color, [...members]); }} /></label><fieldset><legend>Renk</legend><div className="group-colors">{GROUP_COLORS.map((option) => <button key={option} className={color === option ? 'selected' : ''} style={{ background: option }} aria-label={`${option} rengini seç`} onClick={() => setColor(option)} />)}</div></fieldset><fieldset><legend>Üyeler</legend><div className="group-members">{nodes.map((node) => <label key={node.id}><input type="checkbox" checked={members.has(node.id)} onChange={() => toggle(node.id)} />{node.title}</label>)}</div></fieldset><div className="feedback-actions"><button onClick={onClose}>Vazgeç</button><button className="primary" onClick={() => onCreate(title, color, [...members])}>Grubu oluştur</button></div></section></div>;
}
