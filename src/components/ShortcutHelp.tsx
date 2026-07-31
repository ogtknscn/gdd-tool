import { useEffect } from 'react';
import { APP_COMMANDS } from '../commands/appCommands';
import { useUiStore } from '../stores/uiStore';

export function ShortcutHelp() {
  const open = useUiStore((state) => state.shortcutsOpen); const setOpen = useUiStore((state) => state.setShortcutsOpen);
  useEffect(() => { if (!open) return; const close = (event: KeyboardEvent) => { if (event.key === 'Escape') setOpen(false); }; window.addEventListener('keydown', close); return () => window.removeEventListener('keydown', close); }, [open, setOpen]);
  if (!open) return null;
  return <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false); }}><section className="shortcut-dialog" role="dialog" aria-modal="true" aria-labelledby="shortcut-title"><div><h2 id="shortcut-title">Klavye kısayolları</h2><button aria-label="Kapat" onClick={() => setOpen(false)}>×</button></div>{APP_COMMANDS.filter((command) => command.shortcut).map((command) => <p key={command.id}><span>{command.label}</span><kbd>{command.shortcut}</kbd></p>)}<p><span>Hızlı öğe ekle</span><kbd>Shift + A</kbd></p><p><span>Boş tuvalde hızlı ekle</span><kbd>Sağ tık</kbd></p><p><span>Seçili kartı taşı</span><kbd>Ok tuşları</kbd></p><p><span>Panel veya seçimi kapat</span><kbd>Esc</kbd></p></section></div>;
}
