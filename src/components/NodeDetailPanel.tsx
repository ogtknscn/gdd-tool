import { useEffect, useRef } from 'react';
import { TYPE_FIELDS } from '../domain/nodeFields';
import { EDGE_LABELS, NODE_LABELS, STATUS_LABELS, nodeStatuses, type GddNode } from '../domain/types';
import { useProjectStore } from '../stores/projectStore';
import { CommitTitleInput } from './CommitTitleInput';
import { confirmRemoveRelation } from '../commands/relationCommands';

const longFields: Array<{ key: keyof Pick<GddNode, 'designIntent' | 'playerExperience' | 'specification' | 'testNotes'>; label: string; placeholder: string }> = [
  { key: 'designIntent', label: 'Tasarım Niyeti', placeholder: 'Bu öğe hangi tasarım sorununu çözüyor?' },
  { key: 'playerExperience', label: 'Oyuncu Deneyimi', placeholder: 'Oyuncu ne hissetmeli, anlamalı veya yapmalı?' },
  { key: 'specification', label: 'Detaylı Tanım', placeholder: 'Kurallar, sınırlar, istisnalar ve uygulama notları…' },
  { key: 'testNotes', label: 'Test Notları', placeholder: 'Test senaryoları, ölçütler ve gözlemler…' },
];

export function NodeDetailPanel() {
  const panelRef = useRef<HTMLElement>(null);
  const project = useProjectStore((state) => state.project); const detailNodeId = useProjectStore((state) => state.detailNodeId);
  const closeDetail = useProjectStore((state) => state.closeDetail); const updateNode = useProjectStore((state) => state.updateNode); const openDetail = useProjectStore((state) => state.openDetail);
  const node = project.objects.find((item) => item.id === detailNodeId);
  useEffect(() => { const close = (event: KeyboardEvent) => { if (event.key === 'Escape') closeDetail(); }; window.addEventListener('keydown', close); return () => window.removeEventListener('keydown', close); }, [closeDetail]);
  useEffect(() => { if (detailNodeId) panelRef.current?.focus(); }, [detailNodeId]);
  if (!node) return null;
  const relations = project.relations.filter((edge) => edge.source === node.id || edge.target === node.id);
  return <div className="detail-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) closeDetail(); }}><aside ref={panelRef} tabIndex={-1} className="node-detail" role="dialog" aria-modal="true" aria-labelledby="node-detail-title">
    <div className="detail-header"><div><span className="eyebrow">{NODE_LABELS[node.kind]}</span><h2 id="node-detail-title">{node.title}</h2></div><button className="icon-button" aria-label="Detay panelini kapat" onClick={closeDetail}>×</button></div>
    <div className="detail-scroll"><section className="detail-section"><label>Başlık<CommitTitleInput aria-label="Öğe başlığı" value={node.title} onCommit={(title) => updateNode(node.id, { title })} /></label><label>Durum<select value={node.status} onChange={(event) => updateNode(node.id, { status: event.target.value as GddNode['status'] })}>{nodeStatuses.map((status) => <option value={status} key={status}>{STATUS_LABELS[status]}</option>)}</select></label><label>Etiketler<input value={node.tags.join(', ')} placeholder="savaş, ekonomi, onboarding" onChange={(event) => updateNode(node.id, { tags: event.target.value.split(',').map((tag) => tag.trim()).filter(Boolean) })} /></label><label>Kısa Özet<textarea className="compact-textarea" value={node.summary} onChange={(event) => updateNode(node.id, { summary: event.target.value })} /></label></section>
      <section className="detail-section">{longFields.map((field) => <label key={field.key}>{field.label}<textarea value={node[field.key]} placeholder={field.placeholder} onChange={(event) => updateNode(node.id, { [field.key]: event.target.value })} /></label>)}</section>
      <details className="progressive-section"><summary>{NODE_LABELS[node.kind]} Alanları</summary><div>{TYPE_FIELDS[node.kind].map((field) => <label key={field.key}>{field.label}{field.multiline ? <textarea value={node.properties[field.key] ?? ''} placeholder={field.placeholder} onChange={(event) => updateNode(node.id, { properties: { ...node.properties, [field.key]: event.target.value } })} /> : <input value={node.properties[field.key] ?? ''} placeholder={field.placeholder} onChange={(event) => updateNode(node.id, { properties: { ...node.properties, [field.key]: event.target.value } })} />}</label>)}</div></details>
      <section className="detail-section"><h3>İlişkiler</h3>{relations.length ? relations.map((edge) => { const otherId = edge.source === node.id ? edge.target : edge.source; const other = project.objects.find((item) => item.id === otherId); return <div className="detail-relation-row" key={edge.id}><button className="detail-relation" disabled={!other} onClick={() => { if (other) openDetail(other.id); }}><span>{EDGE_LABELS[edge.kind]}</span><strong>{other?.title ?? 'Bulunamayan öğe'}</strong></button><button className="detail-relation-delete" onClick={() => void confirmRemoveRelation(edge.id)}>Sil</button></div>; }) : <p className="muted">Henüz ilişki eklenmedi.</p>}</section>
    </div>
  </aside></div>;
}
