import { feedback } from '../stores/feedbackStore';
import { useProjectStore } from '../stores/projectStore';
import { useUiStore } from '../stores/uiStore';
export async function confirmRemoveRelation(id: string): Promise<boolean> { const relation = useProjectStore.getState().project.relations.find((edge) => edge.id === id); if (!relation) return false; const accepted = await feedback.confirm({ title: 'Bağlantı silinsin mi?', message: 'Bu bağlantı tuvalden kaldırılacak. İşlemi geri alabilirsiniz.', tone: 'danger', confirmLabel: 'Bağlantıyı sil' }); if (!accepted) return false; useProjectStore.getState().removeRelation(id); useUiStore.getState().setSelectedRelation(); return true; }
