import { Handle, NodeToolbar, Position, type Node, type NodeProps } from '@xyflow/react';
import type { CSSProperties } from 'react';
import { confirmRemoveNode } from '../commands/nodeCommands';
import { readinessColor } from '../domain/completeness';
import { nodeLabel, statusLabel, type GddNode } from '../domain/types';
import { useProjectStore } from '../stores/projectStore';
import { useT, useUiStore, type CardDensity } from '../stores/uiStore';

export type GddCardData = { item: GddNode; density: Exclude<CardDensity, 'auto'>; invalid: boolean; completeness: number; readinessView: boolean };
const accents: Record<GddNode['kind'], string> = { mechanic: '#8b74ff', entity: '#19b8b2', level: '#e59647', quest: '#e86e9b', ui: '#62a0ef', asset: '#83a963', narrative: '#c084fc', system: '#eab308', goal: '#34d399', risk: '#ef4444' };

export function GddNodeCard({ id, data, selected, dragging }: NodeProps<Node<GddCardData>>) {
  const t = useT(); const language = useUiStore((state) => state.language);
  const openDetail = useProjectStore((state) => state.openDetail);
  const duplicateNode = useProjectStore((state) => state.duplicateNode);
  const beginConnection = useUiStore((state) => state.beginConnection);
  const connectionSourceId = useUiStore((state) => state.connectionSourceId);
  const item = data.item;
  const accent = data.readinessView ? readinessColor(data.completeness) : accents[item.kind];
  const ariaLabel = t('card.ariaLabel', { kind: nodeLabel(item.kind, language), title: item.title, status: statusLabel(item.status, language) }) + (data.readinessView ? t('card.ariaLabelReadiness', { pct: Math.round(data.completeness * 100) }) : '');
  return <div style={{ '--accent': accent } as CSSProperties} className={`gdd-card density-${data.density} ${selected ? 'selected' : ''} ${dragging ? 'dragging' : ''} ${data.invalid ? 'invalid' : ''} ${connectionSourceId === id ? 'connecting' : ''}`} aria-label={ariaLabel}>
    <Handle type="target" position={Position.Left} aria-label={t('card.targetHandle')} />
    <Handle type="source" position={Position.Right} aria-label={t('card.sourceHandle')} />
    <NodeToolbar position={Position.Top} isVisible={selected} className="node-context-toolbar">
      <button className="nodrag" onClick={() => openDetail(id)}>{t('canvas.detail')}</button>
      <button className="nodrag" onClick={() => beginConnection(id)}>{t('canvas.connectAria')}</button>
      <button className="nodrag" onClick={() => duplicateNode(id)}>{t('canvas.duplicate')}</button>
      <button className="nodrag destructive" aria-label={t('canvas.deleteCard', { title: item.title })} onClick={() => void confirmRemoveNode(id)}>{t('canvas.delete')}</button>
    </NodeToolbar>
    <div className="card-kicker"><span>{nodeLabel(item.kind, language)}</span>{data.readinessView ? <span className="readiness-badge" style={{ color: accent }}>%{Math.round(data.completeness * 100)}</span> : <span className={`status status-${item.status}`}>{statusLabel(item.status, language)}</span>}</div>
    <strong className="card-title">{item.title}</strong>
    {data.density !== 'compact' && <p>{item.summary || t('card.addSummaryPlaceholder')}</p>}
    {data.density === 'detailed' && <><div className="card-meta"><span>{item.tags.slice(0, 2).join(' · ') || t('card.noTags')}</span><span>{item.tags.length > 2 ? `+${item.tags.length - 2}` : ''}</span></div>{item.checklist.length > 0 && <div className="card-checklist-progress" aria-label={t('card.checklistAria', { done: item.checklist.filter((entry) => entry.done).length, total: item.checklist.length })}><span>{t('checklist.title')}</span><b>{item.checklist.filter((entry) => entry.done).length}/{item.checklist.length}</b></div>}</>}
  </div>;
}
