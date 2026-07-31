import { feedback, useFeedbackStore } from '../stores/feedbackStore';
import { useProjectStore } from '../stores/projectStore';
import { useUiStore } from '../stores/uiStore';

export const isEditingShortcutContext = (target: EventTarget | null): boolean => {
  const element = target instanceof HTMLElement ? target : null;
  if (element?.closest('input, textarea, select, [contenteditable="true"], [role="dialog"]')) return true;
  const ui = useUiStore.getState();
  return Boolean(useFeedbackStore.getState().active || ui.paletteOpen || ui.shortcutsOpen || ui.validationOpen || ui.quickAdd);
};

export async function confirmRemoveNode(id: string): Promise<boolean> {
  const state = useProjectStore.getState();
  const node = state.project.objects.find((item) => item.id === id);
  if (!node) return false;
  const relationCount = state.project.relations.filter((relation) => relation.source === id || relation.target === id).length;
  const accepted = await feedback.confirm({
    title: `“${node.title}” silinsin mi?`,
    message: relationCount ? `${relationCount} bağlı ilişki de silinecek. İşlemi geri alabilirsiniz.` : 'Bu kartın bağlı ilişkisi yok. İşlemi geri alabilirsiniz.',
    tone: 'danger',
    confirmLabel: 'Kartı sil',
  });
  if (!accepted) return false;
  useProjectStore.getState().removeNode(id);
  useUiStore.getState().setSelectedRelation();
  return true;
}
