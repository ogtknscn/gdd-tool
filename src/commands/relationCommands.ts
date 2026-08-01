import { t } from '../domain/i18n';
import { feedback } from '../stores/feedbackStore';
import { useProjectStore } from '../stores/projectStore';
import { useUiStore } from '../stores/uiStore';
export async function confirmRemoveRelation(id: string): Promise<boolean> { const relation = useProjectStore.getState().project.relations.find((edge) => edge.id === id); if (!relation) return false; const language = useUiStore.getState().language; const accepted = await feedback.confirm({ title: t(language, 'relationCommands.confirmDeleteTitle'), message: t(language, 'relationCommands.confirmDeleteBody'), tone: 'danger', confirmLabel: t(language, 'relationCommands.confirmDeleteConfirmLabel') }); if (!accepted) return false; useProjectStore.getState().removeRelation(id); useUiStore.getState().setSelectedRelation(); return true; }
