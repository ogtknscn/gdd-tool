import { useMemo } from 'react';
import { projectMarkdown } from '../domain/export';
import { useProjectStore } from '../stores/projectStore';
import { useUiStore } from '../stores/uiStore';

// Renders the same Markdown the "Markdown indir" export produces, live, so a
// designer can see the GDD taking shape without exporting a file each time.
// Deliberately previews the Markdown, not the PDF - PDF layout is generated
// separately in Rust (see export_project_pdf in src-tauri/src/lib.rs) and
// re-implementing that layout here would just be a second thing to keep in
// sync.
export function MarkdownPreviewPanel() {
  const open = useUiStore((state) => state.markdownPreviewOpen);
  const toggle = useUiStore((state) => state.toggleMarkdownPreview);
  const project = useProjectStore((state) => state.project);
  const markdown = useMemo(() => projectMarkdown(project), [project]);
  if (!open) return null;
  return <div className="validation-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) toggle(); }}>
    <aside className="validation-panel markdown-preview" role="dialog" aria-modal="true" aria-labelledby="markdown-preview-title">
      <div className="validation-title"><h2 id="markdown-preview-title">Markdown önizleme</h2><button aria-label="Markdown önizlemeyi kapat" onClick={toggle}>×</button></div>
      <p>Bu, "Markdown indir" ile dışa aktarılacak içeriğin canlı önizlemesidir.</p>
      <pre className="markdown-preview-body">{markdown}</pre>
    </aside>
  </div>;
}
