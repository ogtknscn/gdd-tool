import { Handle, NodeToolbar, Position, type Node, type NodeProps } from '@xyflow/react';
import type { CSSProperties } from 'react';
import { confirmRemoveNode } from '../commands/nodeCommands';
import { NODE_LABELS, STATUS_LABELS, type GddNode } from '../domain/types';
import { useProjectStore } from '../stores/projectStore';
import { useUiStore, type CardDensity } from '../stores/uiStore';

export type GddCardData = { item: GddNode; density: Exclude<CardDensity, 'auto'>; invalid: boolean };
const accents = { mechanic: '#8b74ff', entity: '#19b8b2', level: '#e59647', quest: '#e86e9b', ui: '#62a0ef', asset: '#83a963' };

export function GddNodeCard({ id, data, selected, dragging }: NodeProps<Node<GddCardData>>) {
  const openDetail = useProjectStore((state) => state.openDetail);
  const duplicateNode = useProjectStore((state) => state.duplicateNode);
  const beginConnection = useUiStore((state) => state.beginConnection);
  const connectionSourceId = useUiStore((state) => state.connectionSourceId);
  const item = data.item;
  return <div style={{ '--accent': accents[item.kind] } as CSSProperties} className={`gdd-card density-${data.density} ${selected ? 'selected' : ''} ${dragging ? 'dragging' : ''} ${data.invalid ? 'invalid' : ''} ${connectionSourceId === id ? 'connecting' : ''}`} aria-label={`${NODE_LABELS[item.kind]}: ${item.title}. Durum: ${STATUS_LABELS[item.status]}`}>
    <Handle type="target" position={Position.Left} aria-label="Bağlantı hedefi" />
    <Handle type="source" position={Position.Right} aria-label="Bağlantı kaynağı" />
    <NodeToolbar position={Position.Top} isVisible={selected} className="node-context-toolbar">
      <button className="nodrag" onClick={() => openDetail(id)}>Detay</button>
      <button className="nodrag" onClick={() => beginConnection(id)}>Bağla</button>
      <button className="nodrag" onClick={() => duplicateNode(id)}>Çoğalt</button>
      <button className="nodrag destructive" aria-label={`“${item.title}” kartını sil`} onClick={() => void confirmRemoveNode(id)}>Sil</button>
    </NodeToolbar>
    <div className="card-kicker"><span>{NODE_LABELS[item.kind]}</span><span className={`status status-${item.status}`}>{STATUS_LABELS[item.status]}</span></div>
    <strong className="card-title">{item.title}</strong>
    {data.density !== 'compact' && <p>{item.summary || 'Açıklama ekleyin'}</p>}
    {data.density === 'detailed' && <><div className="card-meta"><span>{item.tags.slice(0, 2).join(' · ') || 'Etiket yok'}</span><span>{item.tags.length > 2 ? `+${item.tags.length - 2}` : ''}</span></div>{item.checklist.length > 0 && <div className="card-checklist-progress" aria-label={`Checklist: ${item.checklist.filter((entry) => entry.done).length}/${item.checklist.length}`}><span>Checklist</span><b>{item.checklist.filter((entry) => entry.done).length}/{item.checklist.length}</b></div>}</>}
  </div>;
}
