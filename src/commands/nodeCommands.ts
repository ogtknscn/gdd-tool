import { t } from '../domain/i18n';
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
  const language = useUiStore.getState().language;
  const relationCount = state.project.relations.filter((relation) => relation.source === id || relation.target === id).length;
  const accepted = await feedback.confirm({
    title: t(language, 'nodeCommands.confirmDeleteTitle', { title: node.title }),
    message: relationCount ? t(language, 'nodeCommands.confirmDeleteBodyWithRelations', { count: relationCount }) : t(language, 'nodeCommands.confirmDeleteBodyNoRelations'),
    tone: 'danger',
    confirmLabel: t(language, 'nodeCommands.confirmDeleteConfirmLabel'),
  });
  if (!accepted) return false;
  useProjectStore.getState().removeNode(id);
  useUiStore.getState().setSelectedRelation();
  return true;
}
