import type { MouseEvent } from 'react';
import { feedback } from '../stores/feedbackStore';
import { useProjectStore } from '../stores/projectStore';
import { useT } from '../stores/uiStore';

export function PageTabs() {
  const t = useT();
  const project = useProjectStore((state) => state.project); const setActivePage = useProjectStore((state) => state.setActivePage); const addPage = useProjectStore((state) => state.addPage); const renamePage = useProjectStore((state) => state.renamePage); const deletePage = useProjectStore((state) => state.deletePage);
  const rename = async (id: string, title: string) => { const value = await feedback.prompt({ title: t('pageTabs.renameTitle'), inputLabel: t('pageTabs.nameLabel'), initialValue: title }); if (value !== null) renamePage(id, value); };
  const remove = async (id: string, title: string) => { if (await feedback.confirm({ title: t('pageTabs.deleteConfirmTitle', { title }), message: t('pageTabs.deleteConfirmBody'), tone: 'danger', confirmLabel: t('pageTabs.closePage') })) deletePage(id); };
  const closeMenu = (event: MouseEvent<HTMLButtonElement>) => { event.currentTarget.closest('details')?.removeAttribute('open'); };
  return <div className="page-tabs" role="tablist">{project.pages.map((page) => <div className={`page-tab ${page.id === project.activePageId ? 'active' : ''}`} key={page.id}><button role="tab" aria-selected={page.id === project.activePageId} onClick={() => setActivePage(page.id)} onDoubleClick={() => void rename(page.id, page.title)}>{page.title}</button><details className="menu tab-menu"><summary aria-label={t('pageTabs.renamePage')}>...</summary><div className="menu-popover"><button onClick={(event) => { closeMenu(event); void rename(page.id, page.title); }}>{t('pageTabs.renamePage')}</button></div></details>{project.pages.length > 1 && <button className="tab-close" title={t('pageTabs.closePage')} onClick={() => void remove(page.id, page.title)}>×</button>}</div>)}<button className="add-page" title={t('pageTabs.newPage')} onClick={() => addPage()}>+</button></div>;
}
