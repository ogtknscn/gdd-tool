import { useProjectStore } from '../stores/projectStore';
import { CommitFieldInput } from './CommitFieldInput';

export function PlaygroundTools() {
  const project = useProjectStore((state) => state.project); const add = useProjectStore((state) => state.addPlaygroundItem); const update = useProjectStore((state) => state.updatePlaygroundItem); const remove = useProjectStore((state) => state.removePlaygroundItem); const items = project.playgroundItems.filter((item) => item.pageId === project.activePageId);
  return <aside className="playground-tools" aria-label="Playground araçları"><div><button onClick={() => add('sticky', 'Yeni not')}>Not</button><button onClick={() => add('text', 'Serbest metin')}>Metin</button><button onClick={() => add('comment', 'Yeni yorum')}>Yorum</button><button disabled title="Yerel görsel içe aktarma henüz güvenli dosya akışı olmadan kullanılamaz">Görsel (yakında)</button></div>{items.map((item) => <section key={item.id} className={`playground-item ${item.type}`}><small>{item.type === 'sticky' ? 'Not' : item.type === 'text' ? 'Metin' : 'Yorum'}</small><CommitFieldInput multiline aria-label="Playground öğesi metni" value={item.text} onCommit={(text) => update(item.id, text)} /><button aria-label="Playground öğesini sil" onClick={() => remove(item.id)}>×</button></section>)}</aside>;
}
