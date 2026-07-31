import { beforeEach, describe, expect, it } from 'vitest';
import { confirmRemoveNode } from '../src/commands/nodeCommands';
import { useFeedbackStore } from '../src/stores/feedbackStore';
import { useProjectStore } from '../src/stores/projectStore';

describe('node removal', () => {
  beforeEach(() => { useFeedbackStore.getState().reset(); useProjectStore.getState().applyTemplate('blank'); });
  it('uses one danger confirmation and undo step for a node, placement, and linked relations', async () => {
    const store = useProjectStore.getState(); store.addNode('mechanic'); store.addNode('ui');
    const [source, target] = useProjectStore.getState().project.objects; store.addRelation(source.id, target.id, 'affects'); store.openDetail(source.id); store.markSaved();
    const undoBefore = useProjectStore.getState().undoStack.length;
    const removal = confirmRemoveNode(source.id);
    expect(useFeedbackStore.getState().active).toMatchObject({ type: 'confirm', tone: 'danger' });
    useFeedbackStore.getState().settle(true);
    await expect(removal).resolves.toBe(true);
    expect(useProjectStore.getState().project.objects.map((node) => node.id)).toEqual([target.id]);
    expect(useProjectStore.getState().project.placements.some((placement) => placement.nodeId === source.id)).toBe(false);
    expect(useProjectStore.getState().project.relations).toHaveLength(0);
    expect(useProjectStore.getState()).toMatchObject({ selectedNodeId: undefined, detailNodeId: undefined, dirty: true });
    expect(useProjectStore.getState().undoStack).toHaveLength(undoBefore + 1);
    useProjectStore.getState().undo();
    expect(useProjectStore.getState().project.objects).toHaveLength(2);
    expect(useProjectStore.getState().project.relations).toHaveLength(1);
  });
});
