import { NodeToolbar, Position, type Node, type NodeProps } from '@xyflow/react';
import { CommitFieldInput } from './CommitFieldInput';
import type { PlaygroundItem } from '../domain/types';
import { useProjectStore } from '../stores/projectStore';

export type PlaygroundCardData = { item: PlaygroundItem };
const TYPE_LABELS: Record<PlaygroundItem['type'], string> = { sticky: 'Not', text: 'Metin', comment: 'Yorum' };

// Renders a playground item as a draggable canvas card, same as a GDD node,
// instead of the old fixed sidebar list - so freeform notes can sit next to
// the cards they annotate rather than in a disconnected panel.
export function PlaygroundCard({ id, data, selected }: NodeProps<Node<PlaygroundCardData>>) {
  const update = useProjectStore((state) => state.updatePlaygroundItem);
  const remove = useProjectStore((state) => state.removePlaygroundItem);
  const item = data.item;
  return <div className={`playground-item ${item.type} ${selected ? 'selected' : ''}`} aria-label={`${TYPE_LABELS[item.type]}: ${item.text || 'boş'}`}>
    <NodeToolbar position={Position.Top} isVisible={selected} className="node-context-toolbar">
      <button className="nodrag destructive" aria-label="Playground öğesini sil" onClick={() => remove(id)}>Sil</button>
    </NodeToolbar>
    <small>{TYPE_LABELS[item.type]}</small>
    <CommitFieldInput multiline className="nodrag" aria-label="Playground öğesi metni" value={item.text} onCommit={(text) => update(id, text)} />
  </div>;
}
