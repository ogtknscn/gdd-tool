import { NodeToolbar, Position, type Node, type NodeProps } from '@xyflow/react';
import { CommitFieldInput } from './CommitFieldInput';
import type { PlaygroundItem } from '../domain/types';
import { useProjectStore } from '../stores/projectStore';
import { useT } from '../stores/uiStore';

export type PlaygroundCardData = { item: PlaygroundItem };

// Renders a playground item as a draggable canvas card, same as a GDD node,
// instead of the old fixed sidebar list - so freeform notes and reference
// images can sit next to the cards they annotate rather than in a
// disconnected panel.
export function PlaygroundCard({ id, data, selected }: NodeProps<Node<PlaygroundCardData>>) {
  const t = useT();
  const update = useProjectStore((state) => state.updatePlaygroundItem);
  const remove = useProjectStore((state) => state.removePlaygroundItem);
  const item = data.item;
  const typeLabel = t(`playground.${item.type}`);
  return <div className={`playground-item ${item.type} ${selected ? 'selected' : ''}`} aria-label={`${typeLabel}: ${item.title || item.text || item.type}`}>
    <NodeToolbar position={Position.Top} isVisible={selected} className="node-context-toolbar">
      <button className="nodrag destructive" aria-label={t('canvas.deletePlaygroundItem')} onClick={() => remove(id)}>{t('canvas.delete')}</button>
    </NodeToolbar>
    <CommitFieldInput className="nodrag playground-title" aria-label={t('playground.titleAria')} placeholder={t('playground.titlePlaceholder')} value={item.title} onCommit={(title) => update(id, { title })} />
    {item.type === 'image'
      ? <>{item.imageData && <img src={item.imageData} alt={item.title || item.text || typeLabel} className="playground-image" />}<CommitFieldInput className="nodrag" aria-label={t('playground.imageCaptionPlaceholder')} placeholder={t('playground.imageCaptionPlaceholder')} value={item.text} onCommit={(text) => update(id, { text })} /></>
      : <CommitFieldInput multiline className="nodrag" aria-label={t('playground.textAria')} value={item.text} onCommit={(text) => update(id, { text })} />}
  </div>;
}
