import { useEffect, useRef } from 'react';
import { templates, type TemplateId } from '../domain/templates';

type Props = { required: boolean; onChoose: (id: TemplateId) => void; onClose: () => void };
export function TemplateWelcome({ required, onChoose, onClose }: Props) {
  const dialogRef = useRef<HTMLElement>(null);
  useEffect(() => { window.setTimeout(() => dialogRef.current?.querySelector<HTMLButtonElement>('button')?.focus()); }, []);
  return <div className="modal-backdrop" onMouseDown={(event) => { if (!required && event.target === event.currentTarget) onClose(); }}><section ref={dialogRef} className="template-dialog template-welcome" role="dialog" aria-modal="true" aria-labelledby="template-welcome-title"><span className="eyebrow">Başlangıç noktası</span><h2 id="template-welcome-title">Çalışma alanını seçin</h2><p>İhtiyacınıza yakın bir akışla başlayın; tüm öğeleri sonra değiştirebilirsiniz.</p>{!required && <button className="close" aria-label="Şablonları kapat" onClick={onClose}>×</button>}<div className="template-grid">{templates.map((template) => <button className="template-card" key={template.id} onClick={() => onChoose(template.id)}><small>{template.category}</small><strong>{template.name}</strong><span>{template.description}</span><em>{template.useCase}</em><footer><b>{template.startingCounts}</b><i>{template.preview}</i></footer></button>)}</div></section></div>;
}
