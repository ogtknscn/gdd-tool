import { useEffect, useRef, useState } from 'react';
import { GROUP_COLORS } from '../domain/groups';
import type { GddNode } from '../domain/types';
import { useT } from '../stores/uiStore';

type Props = { nodes: GddNode[]; selectedMemberIds: string[]; onCreate: (title: string, color: string, memberIds: string[]) => void; onClose: () => void };
export function GroupCreateDialog({ nodes, selectedMemberIds, onCreate, onClose }: Props) {
  const t = useT();
  const [title, setTitle] = useState(t('groupDialog.defaultTitle')); const [color, setColor] = useState<string>(GROUP_COLORS[0]); const [members, setMembers] = useState(() => new Set(selectedMemberIds)); const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { window.setTimeout(() => inputRef.current?.focus()); }, []);
  const toggle = (id: string) => setMembers((current) => { const next = new Set(current); if (next.has(id)) next.delete(id); else next.add(id); return next; });
  return <div className="group-dialog-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><section className="group-dialog" role="dialog" aria-modal="true" aria-labelledby="group-dialog-title"><h2 id="group-dialog-title">{t('groupDialog.title')}</h2><p>{t('groupDialog.description')}</p><label>{t('groupDialog.nameLabel')}<input ref={inputRef} value={title} onChange={(event) => setTitle(event.target.value)} onKeyDown={(event) => { if (event.key === 'Escape') onClose(); if (event.key === 'Enter' && !event.nativeEvent.isComposing) onCreate(title, color, [...members]); }} /></label><fieldset><legend>{t('groupDialog.colorLabel')}</legend><div className="group-colors">{GROUP_COLORS.map((option) => <button key={option} className={color === option ? 'selected' : ''} style={{ background: option }} aria-label={t('groupDialog.colorAria', { color: option })} onClick={() => setColor(option)} />)}</div></fieldset><fieldset><legend>{t('groupDialog.membersLabel')}</legend><div className="group-members">{nodes.map((node) => <label key={node.id}><input type="checkbox" checked={members.has(node.id)} onChange={() => toggle(node.id)} />{node.title}</label>)}</div></fieldset><div className="feedback-actions"><button onClick={onClose}>{t('groupDialog.cancel')}</button><button className="primary" onClick={() => onCreate(title, color, [...members])}>{t('groupDialog.create')}</button></div></section></div>;
}
