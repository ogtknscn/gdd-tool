import { useEffect, useRef } from 'react';
import { templates, templatePickerText, type TemplateId } from '../domain/templates';
import { useT, useUiStore } from '../stores/uiStore';

type Props = { required: boolean; onChoose: (id: TemplateId) => void; onClose: () => void };
export function TemplateWelcome({ required, onChoose, onClose }: Props) {
  const t = useT(); const language = useUiStore((state) => state.language);
  const dialogRef = useRef<HTMLElement>(null);
  useEffect(() => { window.setTimeout(() => dialogRef.current?.querySelector<HTMLButtonElement>('button')?.focus()); }, []);
  return <div className="modal-backdrop" onMouseDown={(event) => { if (!required && event.target === event.currentTarget) onClose(); }}><section ref={dialogRef} className="template-dialog template-welcome" role="dialog" aria-modal="true" aria-labelledby="template-welcome-title"><span className="eyebrow">{t('templates.eyebrow')}</span><h2 id="template-welcome-title">{t('templates.title')}</h2><p>{t('templates.subtitle')}</p>{!required && <button className="close" aria-label={t('templates.close')} onClick={onClose}>×</button>}<div className="template-grid">{templates.map((template) => { const text = templatePickerText(template, language); return <button className="template-card" key={template.id} onClick={() => onChoose(template.id)}><small>{text.category}</small><strong>{text.name}</strong><span>{text.description}</span><em>{text.useCase}</em><footer><b>{text.startingCounts}</b><i>{text.preview}</i></footer></button>; })}</div></section></div>;
}
