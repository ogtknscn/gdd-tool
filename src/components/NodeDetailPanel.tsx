import { useEffect, useRef, useState } from 'react';
import { confirmRemoveRelation } from '../commands/relationCommands';
import { typeFields } from '../domain/nodeFields';
import { edgeLabel, nodeLabel, statusLabel, nodeStatuses, type GddNode } from '../domain/types';
import { useProjectStore } from '../stores/projectStore';
import { useT, useUiStore } from '../stores/uiStore';
import { CommitTitleInput } from './CommitTitleInput';
import { CommitTagsInput } from './CommitTagsInput';
import { CommitFieldInput } from './CommitFieldInput';
import { CommitRelationLabelInput } from './CommitRelationLabelInput';
import { ChecklistEditor } from './ChecklistEditor';

// A properties key that isn't in typeFields() for this node's kind round-trips
// through save/load untouched but has no input to edit it. This lets a
// teammate add one ad hoc (e.g. "Monetizasyon") without a code change; if the
// same key turns out to matter across several projects, promote it into
// nodeFields.ts's TYPE_FIELDS_BY_LANGUAGE instead of leaving it as a one-off
// per node.
function CustomFieldAdder({ onAdd, existingKeys }: { onAdd: (key: string) => void; existingKeys: Set<string> }) {
  const t = useT();
  const [value, setValue] = useState('');
  const commit = () => { const key = value.trim(); if (!key || existingKeys.has(key)) return; onAdd(key); setValue(''); };
  return <div className="custom-field-adder"><input aria-label={t('detail.addCustomFieldPlaceholder')} placeholder={t('detail.addCustomFieldPlaceholder')} value={value} onChange={(event) => setValue(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); commit(); } }} /><button type="button" onClick={commit} disabled={!value.trim()}>{t('detail.addCustomField')}</button></div>;
}

export function NodeDetailPanel() {
  const t = useT(); const language = useUiStore((state) => state.language);
  const panelRef = useRef<HTMLElement>(null);
  const project = useProjectStore((state) => state.project); const detailNodeId = useProjectStore((state) => state.detailNodeId);
  const closeDetail = useProjectStore((state) => state.closeDetail); const updateNode = useProjectStore((state) => state.updateNode); const updateRelation = useProjectStore((state) => state.updateRelation); const openDetail = useProjectStore((state) => state.openDetail); const addChecklistItem = useProjectStore((state) => state.addChecklistItem); const updateChecklistItem = useProjectStore((state) => state.updateChecklistItem); const toggleChecklistItem = useProjectStore((state) => state.toggleChecklistItem); const removeChecklistItem = useProjectStore((state) => state.removeChecklistItem); const moveChecklistItem = useProjectStore((state) => state.moveChecklistItem);
  const node = project.objects.find((item) => item.id === detailNodeId);
  useEffect(() => { const close = (event: KeyboardEvent) => { if (event.key === 'Escape') closeDetail(); }; window.addEventListener('keydown', close); return () => window.removeEventListener('keydown', close); }, [closeDetail]);
  useEffect(() => { if (detailNodeId) panelRef.current?.focus(); }, [detailNodeId]);
  if (!node) return null;
  const relations = project.relations.filter((edge) => edge.source === node.id || edge.target === node.id);
  const longFields: Array<{ key: keyof Pick<GddNode, 'designIntent' | 'playerExperience' | 'specification' | 'testNotes'>; label: string; placeholder: string }> = [
    { key: 'designIntent', label: t('detail.designIntent'), placeholder: t('detail.designIntentPlaceholder') },
    { key: 'playerExperience', label: t('detail.playerExperience'), placeholder: t('detail.playerExperiencePlaceholder') },
    { key: 'specification', label: t('detail.specification'), placeholder: t('detail.specificationPlaceholder') },
    { key: 'testNotes', label: t('detail.testNotes'), placeholder: t('detail.testNotesPlaceholder') },
  ];
  return <div className="detail-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) closeDetail(); }}><aside ref={panelRef} tabIndex={-1} className="node-detail" role="dialog" aria-modal="true" aria-labelledby="node-detail-title">
    <div className="detail-header"><div><span className="eyebrow">{nodeLabel(node.kind, language)}</span><h2 id="node-detail-title">{node.title}</h2></div><button className="icon-button" aria-label={t('detail.close')} onClick={closeDetail}>×</button></div>
    <div className="detail-scroll">
      <section className="detail-section"><label>{t('detail.titleLabel')}<CommitTitleInput aria-label={t('inspector.titleAria')} value={node.title} onCommit={(title) => updateNode(node.id, { title })} /></label><label>{t('detail.status')}<select value={node.status} onChange={(event) => updateNode(node.id, { status: event.target.value as GddNode['status'] })}>{nodeStatuses.map((status) => <option value={status} key={status}>{statusLabel(status, language)}</option>)}</select></label><label>{t('detail.tags')}<CommitTagsInput aria-label={t('detail.tags')} value={node.tags} placeholder={t('detail.tagsPlaceholder')} onCommit={(tags) => updateNode(node.id, { tags })} /></label><label>{t('detail.shortSummary')}<CommitFieldInput multiline className="compact-textarea" aria-label={t('detail.shortSummary')} value={node.summary} onCommit={(summary) => updateNode(node.id, { summary })} /></label></section>
      <section className="detail-section">{longFields.map((field) => <label key={field.key}>{field.label}<CommitFieldInput multiline aria-label={field.label} value={node[field.key]} placeholder={field.placeholder} onCommit={(value) => updateNode(node.id, { [field.key]: value })} /></label>)}</section>
      <details className="progressive-section"><summary>{t('detail.typeFields', { kind: nodeLabel(node.kind, language) })}</summary><div>{typeFields(node.kind, language).map((field) => <label key={field.key}>{field.label}<CommitFieldInput multiline={field.multiline} aria-label={field.label} value={node.properties[field.key] ?? ''} placeholder={field.placeholder} onCommit={(value) => updateNode(node.id, { properties: { ...node.properties, [field.key]: value } })} /></label>)}
        {Object.entries(node.properties).filter(([key]) => !typeFields(node.kind, language).some((field) => field.key === key)).map(([key, value]) => <label key={key}>{key}<div className="custom-field-row"><CommitFieldInput multiline aria-label={key} value={value} onCommit={(next) => updateNode(node.id, { properties: { ...node.properties, [key]: next } })} /><button type="button" aria-label={t('detail.deleteCustomField', { key })} onClick={() => { const rest = { ...node.properties }; delete rest[key]; updateNode(node.id, { properties: rest }); }}>×</button></div></label>)}
        <CustomFieldAdder existingKeys={new Set(Object.keys(node.properties))} onAdd={(key) => updateNode(node.id, { properties: { ...node.properties, [key]: '' } })} />
      </div></details>
      <ChecklistEditor items={node.checklist} onAdd={() => addChecklistItem(node.id)} onUpdate={(itemId, text) => updateChecklistItem(node.id, itemId, text)} onToggle={(itemId) => toggleChecklistItem(node.id, itemId)} onRemove={(itemId) => removeChecklistItem(node.id, itemId)} onMove={(itemId, direction) => moveChecklistItem(node.id, itemId, direction)} />
      <section className="detail-section"><h3>{t('detail.relations')}</h3>{relations.length ? relations.map((edge) => { const otherId = edge.source === node.id ? edge.target : edge.source; const other = project.objects.find((item) => item.id === otherId); return <div className="detail-relation-row" key={edge.id}><div><button className="detail-relation" disabled={!other} onClick={() => { if (other) openDetail(other.id); }}><span>{edgeLabel(edge.kind, language)}</span><strong>{other?.title ?? t('detail.notFound')}</strong></button><label>{t('inspector.customLabel')}<CommitRelationLabelInput aria-label={t('detail.customLabelAria', { label: edgeLabel(edge.kind, language) })} value={edge.customLabel} placeholder={edgeLabel(edge.kind, language)} onCommit={(customLabel) => updateRelation(edge.id, { customLabel })} /></label></div><button className="detail-relation-delete" onClick={() => void confirmRemoveRelation(edge.id)}>{t('detail.deleteRelation')}</button></div>; }) : <p className="muted">{t('detail.noRelationsYet')}</p>}</section>
    </div>
  </aside></div>;
}
