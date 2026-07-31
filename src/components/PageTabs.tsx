import { useProjectStore } from '../stores/projectStore';

export function PageTabs() {
  const project = useProjectStore((state) => state.project); const setActivePage = useProjectStore((state) => state.setActivePage);
  const addPage = useProjectStore((state) => state.addPage); const renamePage = useProjectStore((state) => state.renamePage); const deletePage = useProjectStore((state) => state.deletePage);
  return <div className="page-tabs" role="tablist">{project.pages.map((page) => <div className={`page-tab ${page.id === project.activePageId ? 'active' : ''}`} key={page.id}><button role="tab" onClick={() => setActivePage(page.id)} onDoubleClick={() => { const title = window.prompt('Sayfa adı', page.title); if (title !== null) renamePage(page.id, title); }}>{page.title}</button>{project.pages.length > 1 && <button className="tab-close" title="Sayfayı sil" onClick={() => { if (window.confirm(`“${page.title}” sayfası ve içeriği silinsin mi?`)) deletePage(page.id); }}>×</button>}</div>)}<button className="add-page" title="Yeni sayfa" onClick={() => addPage()}>+</button></div>;
}
