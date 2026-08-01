import { BaseEdge, EdgeLabelRenderer, getBezierPath, type Edge, type EdgeProps } from '@xyflow/react';
import { confirmRemoveRelation } from '../commands/relationCommands';
import { type EdgeKind } from '../domain/types';
import { useProjectStore } from '../stores/projectStore';
import { useT } from '../stores/uiStore';
import { CommitRelationLabelInput } from './CommitRelationLabelInput';

export type GddEdgeData = { kind: EdgeKind; label: string; customLabel: string; invalid: boolean };

export function GddEdge({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, markerEnd, selected, data }: EdgeProps<Edge<GddEdgeData>>) {
  const t = useT();
  const updateRelation = useProjectStore((state) => state.updateRelation);
  const [path, labelX, labelY] = getBezierPath({ sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition });
  const label = data?.customLabel || data?.label;
  return <>
    <BaseEdge id={id} path={path} markerEnd={markerEnd} style={{ stroke: data?.invalid ? '#ff7188' : selected ? '#b8aaff' : '#7d89a3', strokeWidth: selected ? 3 : 1.5 }} />
    <EdgeLabelRenderer>
      <div className={`edge-center-label ${selected ? 'selected' : ''}`} style={{ transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)` }}>
        {selected ? <CommitRelationLabelInput className="nodrag nopan" aria-label={t('inspector.customLabel')} value={data?.customLabel ?? ''} placeholder={data?.label ?? ''} onCommit={(customLabel) => updateRelation(id, { customLabel })} /> : <span>{label}</span>}
        {selected && <button className="nodrag nopan" onClick={() => void confirmRemoveRelation(id)}>{t('inspector.deleteRelation')}</button>}
      </div>
    </EdgeLabelRenderer>
  </>;
}
