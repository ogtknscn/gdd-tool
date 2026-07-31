import { NODE_LABELS, type NodeKind } from '../domain/types';
import { useProjectStore } from '../stores/projectStore';

const items: Array<{ kind: NodeKind; icon: string }> = [{ kind: 'mechanic', icon: 'M' }, { kind: 'entity', icon: 'V' }, { kind: 'level', icon: 'B' }, { kind: 'quest', icon: 'G' }, { kind: 'ui', icon: 'UI' }, { kind: 'asset', icon: 'A' }];
export function CreationRail({ onTemplates }: { onTemplates: () => void }) {
  const addNode = useProjectStore((state) => state.addNode);
  return <aside className="creation-rail" aria-label="Öğe oluşturma araçları">{items.map(({ kind, icon }) => <button key={kind} title={`${NODE_LABELS[kind]} ekle`} aria-label={`${NODE_LABELS[kind]} ekle`} onClick={() => addNode(kind)}><span>{icon}</span></button>)}<span className="rail-divider" /><button title="Şablon ekle" aria-label="Şablonları aç" onClick={onTemplates}>▦</button></aside>;
}
