import { nodeLabel, nodeKinds as kinds } from '../domain/types';
import { nodeMatchesFilter } from './Canvas';
import { useProjectStore } from '../stores/projectStore';
import { useT, useUiStore } from '../stores/uiStore';

export function Outline() {
  const t = useT();
  const language = useUiStore((state) => state.language);
  const project = useProjectStore((state) => state.project);
  const selected = useProjectStore((state) => state.selectedNodeId);
  const select = useProjectStore((state) => state.select);
  const toggle = useUiStore((state) => state.toggleOutline);
  const filter = useUiStore((state) => state.nodeFilter);
  const focusedGroupId = useUiStore((state) => state.focusedGroupId);
  const setFocusedGroup = useUiStore((state) => state.setFocusedGroup);
  const pageGroups = project.groups.filter((group) => group.pageId === project.activePageId);
  const pageObjects = project.objects.filter((item) => item.pageId === project.activePageId && nodeMatchesFilter(item, filter));

  return <aside id="outline-panel" className="outline"><div className="panel-heading"><h2>{t('outline.title')}</h2><button aria-label={t('outline.close')} onClick={toggle}>‹</button></div>{pageGroups.length > 0 && <section><div className="outline-heading"><span>{t('outline.groups')}</span></div>{pageGroups.map((group) => <button className={`outline-item outline-group ${focusedGroupId === group.id ? 'selected' : ''}`} key={group.id} aria-pressed={focusedGroupId === group.id} onClick={() => setFocusedGroup(focusedGroupId === group.id ? undefined : group.id)}><i style={{ background: group.color }} />{group.title || t('outline.unnamedGroup')} <small>{group.memberNodeIds.length}</small></button>)}</section>}{kinds.map((kind) => <section key={kind}><div className="outline-heading"><span>{nodeLabel(kind, language)}</span></div>{pageObjects.filter((item) => item.kind === kind).map((item) => <button className={`outline-item ${selected === item.id ? 'selected' : ''}`} key={item.id} onClick={() => select(item.id)}>{item.title}</button>)}</section>)}</aside>;
}
