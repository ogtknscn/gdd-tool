import { useEffect } from 'react';
import { APP_COMMANDS } from '../commands/appCommands';
import { useT, useUiStore } from '../stores/uiStore';

export function ShortcutHelp() {
  const t = useT();
  const open = useUiStore((state) => state.shortcutsOpen); const setOpen = useUiStore((state) => state.setShortcutsOpen);
  useEffect(() => { if (!open) return; const close = (event: KeyboardEvent) => { if (event.key === 'Escape') setOpen(false); }; window.addEventListener('keydown', close); return () => window.removeEventListener('keydown', close); }, [open, setOpen]);
  if (!open) return null;
  return <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false); }}><section className="shortcut-dialog" role="dialog" aria-modal="true" aria-labelledby="shortcut-title"><div><h2 id="shortcut-title">{t('shortcuts.title')}</h2><button aria-label={t('shortcuts.close')} onClick={() => setOpen(false)}>×</button></div>{APP_COMMANDS.filter((command) => command.shortcut).map((command) => <p key={command.id}><span>{t(command.labelKey)}</span><kbd>{command.shortcut}</kbd></p>)}<p><span>{t('shortcuts.quickAdd')}</span><kbd>Shift + A</kbd></p><p><span>{t('shortcuts.paneQuickAdd')}</span><kbd>{t('shortcuts.rightClick')}</kbd></p><p><span>{t('shortcuts.moveCard')}</span><kbd>{t('shortcuts.arrowKeys')}</kbd></p><p><span>{t('shortcuts.closePanel')}</span><kbd>Esc</kbd></p></section></div>;
}
