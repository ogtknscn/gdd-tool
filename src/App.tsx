import { useCallback, useEffect, useMemo, useState } from 'react';
import type { AppCommandId } from './commands/appCommands';
import { AppHeader } from './components/AppHeader';
import { Canvas } from './components/Canvas';
import { CommandPalette } from './components/CommandPalette';
import { CreationRail } from './components/CreationRail';
import { FeedbackHost } from './components/FeedbackHost';
import { Inspector } from './components/Inspector';
import { NodeDetailPanel } from './components/NodeDetailPanel';
import { Outline } from './components/Outline';
import { PageTabs } from './components/PageTabs';
import { ShortcutHelp } from './components/ShortcutHelp';
import { ValidationPanel } from './components/ValidationPanel';
import { templates, type TemplateId } from './domain/templates';
import { loadRecoverySnapshot, openProjectFile, saveProjectFile, saveRecoverySnapshot } from './domain/storage';
import { validateProject } from './domain/validation';
import { feedback } from './stores/feedbackStore';
import { useProjectStore } from './stores/projectStore';
import { useUiStore } from './stores/uiStore';

type SaveState = 'loading' | 'saving' | 'saved' | 'error';
type SaveResult = 'saved' | 'cancelled' | 'failed';

export default function App() {
  const [showTemplates, setShowTemplates] = useState(true);
  const [hydrated, setHydrated] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>('loading');
  const project = useProjectStore((state) => state.project);
  const dirty = useProjectStore((state) => state.dirty);
  const currentFilePath = useProjectStore((state) => state.currentFilePath);
  const undoStack = useProjectStore((state) => state.undoStack);
  const redoStack = useProjectStore((state) => state.redoStack);
  const outlineOpen = useUiStore((state) => state.outlineOpen);
  const inspectorOpen = useUiStore((state) => state.inspectorOpen);
  const density = useUiStore((state) => state.cardDensity);
  const issues = useMemo(() => validateProject(project), [project]);

  useEffect(() => {
    void loadRecoverySnapshot()
      .then((snapshot) => {
        if (snapshot) {
          useProjectStore.getState().replaceProject(snapshot, undefined, true);
          setShowTemplates(false);
        }
        setSaveState('saved');
      })
      .catch((error) => {
        setSaveState('error');
        feedback.toast(`Kurtarma kaydı yüklenemedi: ${String(error)}`, 'error');
      })
      .finally(() => setHydrated(true));
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const timeout = window.setTimeout(() => {
      void saveRecoverySnapshot(project).catch(() => setSaveState('error'));
    }, 650);
    return () => window.clearTimeout(timeout);
  }, [hydrated, project]);

  useEffect(() => {
    const beforeUnload = (event: BeforeUnloadEvent) => {
      if (!useProjectStore.getState().dirty) return;
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', beforeUnload);
    return () => window.removeEventListener('beforeunload', beforeUnload);
  }, []);

  const save = useCallback(async (saveAs = false): Promise<SaveResult> => {
    setSaveState('saving');
    try {
      const store = useProjectStore.getState();
      const path = await saveProjectFile(store.project, store.currentFilePath, saveAs);
      if (!path) {
        setSaveState('saved');
        feedback.toast('Kaydetme iptal edildi.');
        return 'cancelled';
      }
      store.markSaved(path);
      setSaveState('saved');
      feedback.toast('Proje kaydedildi.', 'success');
      return 'saved';
    } catch (error) {
      setSaveState('error');
      feedback.toast(`Proje kaydedilemedi: ${String(error)}`, 'error');
      return 'failed';
    }
  }, []);

  const guardUnsaved = useCallback(async () => {
    if (!useProjectStore.getState().dirty) return true;
    const choice = await feedback.choose({
      title: 'Kaydedilmemiş değişiklikler',
      message: 'Devam etmeden önce değişikliklerinizi kaydedebilirsiniz.',
      choices: [
        { value: 'save', label: 'Kaydet' },
        { value: 'discard', label: 'Kaydetmeden devam', tone: 'danger' },
      ],
      cancelLabel: 'İptal',
    });
    if (choice === 'discard') return true;
    if (choice === 'save') return (await save()) === 'saved';
    return false;
  }, [save]);

  const open = useCallback(async () => {
    if (!await guardUnsaved()) return;
    try {
      const opened = await openProjectFile();
      if (opened) {
        useProjectStore.getState().replaceProject(opened.project, opened.path);
        setShowTemplates(false);
        setSaveState('saved');
      }
    } catch (error) {
      setSaveState('error');
      feedback.toast(`Proje açılamadı: ${String(error)}`, 'error');
    }
  }, [guardUnsaved]);

  const createNew = useCallback(async () => {
    if (!await guardUnsaved()) return;
    useProjectStore.getState().newProject();
    setShowTemplates(true);
  }, [guardUnsaved]);

  const run = useCallback((id: AppCommandId) => {
    const store = useProjectStore.getState();
    const ui = useUiStore.getState();
    const actions: Record<AppCommandId, () => void> = {
      new: () => void createNew(),
      open: () => void open(),
      save: () => void save(),
      saveAs: () => void save(true),
      undo: store.undo,
      redo: store.redo,
      templates: () => setShowTemplates(true),
      validation: ui.toggleValidation,
      outline: ui.toggleOutline,
      inspector: ui.toggleInspector,
      shortcuts: () => ui.setShortcutsOpen(true),
      addMechanic: () => store.addNode('mechanic'),
      addEntity: () => store.addNode('entity'),
      addLevel: () => store.addNode('level'),
      addQuest: () => store.addNode('quest'),
      addUi: () => store.addNode('ui'),
      addAsset: () => store.addNode('asset'),
    };
    actions[id]();
  }, [createNew, open, save]);

  useEffect(() => {
    const keydown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const typing = target?.matches('input, textarea, select, [contenteditable="true"]');
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        useUiStore.getState().setPaletteOpen(true);
        return;
      }
      if (!typing && event.key === '?') {
        event.preventDefault();
        useUiStore.getState().setShortcutsOpen(true);
        return;
      }
      if (!(event.ctrlKey || event.metaKey)) return;
      const key = event.key.toLowerCase();
      if (key === 's') {
        event.preventDefault();
        run(event.shiftKey ? 'saveAs' : 'save');
      } else if (key === 'o') {
        event.preventDefault();
        run('open');
      } else if (key === 'n') {
        event.preventDefault();
        run('new');
      } else if (key === 'z') {
        event.preventDefault();
        run(event.shiftKey ? 'redo' : 'undo');
      } else if (key === 'y') {
        event.preventDefault();
        run('redo');
      }
    };
    window.addEventListener('keydown', keydown);
    return () => window.removeEventListener('keydown', keydown);
  }, [run]);

  const chooseTemplate = async (id: TemplateId) => {
    if (!await guardUnsaved()) return;
    useProjectStore.getState().applyTemplate(id);
    setShowTemplates(false);
  };
  const saveLabel = saveState === 'loading' ? 'Yükleniyor' : saveState === 'saving' ? 'Kaydediliyor' : saveState === 'error' ? 'Kayıt hatası' : dirty ? 'Kaydedilmedi' : 'Kaydedildi';

  return (
    <div className="app-shell">
      <AppHeader title={project.title} dirty={dirty} filePath={currentFilePath} saveLabel={saveLabel} saveState={saveState} issueCount={issues.length} canUndo={Boolean(undoStack.length)} canRedo={Boolean(redoStack.length)} density={density} run={run} setDensity={useUiStore.getState().setCardDensity} />
      <PageTabs />
      <div className={`workspace ${outlineOpen ? 'has-outline' : ''} ${inspectorOpen ? 'has-inspector' : ''}`}>
        <CreationRail onTemplates={() => setShowTemplates(true)} />
        {outlineOpen && <Outline />}
        <Canvas />
        {inspectorOpen && <Inspector />}
      </div>
      <ValidationPanel />
      <NodeDetailPanel />
      <CommandPalette run={run} />
      <ShortcutHelp />
      {showTemplates && (
        <div className="modal-backdrop">
          <section className="template-dialog">
            {hydrated && <button className="close" aria-label="Şablonları kapat" onClick={() => setShowTemplates(false)}>×</button>}
            <span className="eyebrow">Başlangıç noktası</span>
            <h2>Çalışma alanını seçin</h2>
            <div className="template-grid">
              {templates.map((template) => (
                <button className="template-card" key={template.id} onClick={() => void chooseTemplate(template.id)}>
                  <strong>{template.name}</strong>
                  <span>{template.description}</span>
                </button>
              ))}
            </div>
          </section>
        </div>
      )}
      <FeedbackHost />
    </div>
  );
}
