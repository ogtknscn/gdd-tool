import { beforeEach, describe, expect, it } from 'vitest';
import { useProjectStore } from '../src/stores/projectStore';

describe('project store', () => {
  beforeEach(() => useProjectStore.getState().applyTemplate('blank'));
  it('keeps object content separate from canvas placement and supports undo', () => {
    const store = useProjectStore.getState(); store.addNode('mechanic');
    const id = useProjectStore.getState().project.objects[0].id;
    store.moveNode(id, 300, 160);
    expect(useProjectStore.getState().project.objects[0].id).toBe(id);
    expect(useProjectStore.getState().project.placements[0]).toMatchObject({ nodeId: id, x: 300, y: 160 });
    useProjectStore.getState().undo();
    expect(useProjectStore.getState().project.placements[0]).toMatchObject({ x: 180, y: 180 });
  });
  it('does not add duplicate typed relations', () => {
    const store = useProjectStore.getState(); store.addNode('mechanic'); store.addNode('ui');
    const [source, target] = useProjectStore.getState().project.objects;
    store.addRelation(source.id, target.id, 'affects'); store.addRelation(source.id, target.id, 'affects');
    expect(useProjectStore.getState().project.relations).toHaveLength(1);
  });
  it('adds a selected node at a canvas position and optional relation in one undo step', () => {
    const store = useProjectStore.getState(); store.addNode('mechanic');
    const source = useProjectStore.getState().project.objects[0]; const undoBefore = useProjectStore.getState().undoStack.length;
    store.addNodeAt('quest', { x: 640, y: 320 }, source.id, 'requires');
    const added = useProjectStore.getState().project.objects.at(-1)!;
    expect(useProjectStore.getState().selectedNodeId).toBe(added.id);
    expect(useProjectStore.getState().project.placements.at(-1)).toMatchObject({ nodeId: added.id, x: 640, y: 320 });
    expect(useProjectStore.getState().project.relations.at(-1)).toMatchObject({ source: source.id, target: added.id, kind: 'requires', customLabel: '' });
    expect(useProjectStore.getState().undoStack).toHaveLength(undoBefore + 1);
    store.undo();
    expect(useProjectStore.getState().project.objects).toHaveLength(1);
    expect(useProjectStore.getState().project.relations).toHaveLength(0);
  });
  it('stores custom relation labels with a 120 character limit and supports undo', () => {
    const store = useProjectStore.getState(); store.addNode('mechanic'); store.addNode('ui');
    const [source, target] = useProjectStore.getState().project.objects; store.addRelation(source.id, target.id, 'affects');
    const relation = useProjectStore.getState().project.relations[0];
    expect(relation.customLabel).toBe('');
    store.updateRelation(relation.id, { customLabel: 'Oyuncu güvenini azaltır' });
    expect(useProjectStore.getState().project.relations[0].customLabel).toBe('Oyuncu güvenini azaltır');
    store.updateRelation(relation.id, { customLabel: 'a'.repeat(121) });
    expect(useProjectStore.getState().project.relations[0].customLabel).toHaveLength(120);
    store.undo();
    expect(useProjectStore.getState().project.relations[0].customLabel).toBe('Oyuncu güvenini azaltır');
  });
  it('manages logical group membership without deleting cards or relations', () => {
    const store = useProjectStore.getState(); store.addNode('mechanic'); store.addNode('quest');
    const [first, second] = useProjectStore.getState().project.objects; store.addRelation(first.id, second.id, 'affects');
    const undoBefore = useProjectStore.getState().undoStack.length; store.createGroup('Tutorial', '#7058dd', [first.id, first.id, second.id]);
    const group = useProjectStore.getState().project.groups[0];
    expect(group).toMatchObject({ title: 'Tutorial', color: '#7058dd', memberNodeIds: [first.id, second.id] });
    expect(useProjectStore.getState().undoStack).toHaveLength(undoBefore + 1);
    store.removeGroupMembers(group.id, [first.id]); expect(useProjectStore.getState().project.groups[0].memberNodeIds).toEqual([second.id]);
    store.addGroupMembers(group.id, [first.id]); expect(useProjectStore.getState().project.groups[0].memberNodeIds).toEqual([second.id, first.id]);
    store.deleteGroup(group.id);
    expect(useProjectStore.getState().project.groups).toHaveLength(0);
    expect(useProjectStore.getState().project.objects).toHaveLength(2); expect(useProjectStore.getState().project.relations).toHaveLength(1);
  });
  it('keeps page content isolated and removes it with its page', () => {
    const store = useProjectStore.getState(); store.addNode('mechanic');
    const firstPage = useProjectStore.getState().project.activePageId;
    store.addPage('Combat'); useProjectStore.getState().addNode('entity');
    const secondPage = useProjectStore.getState().project.activePageId;
    expect(useProjectStore.getState().project.objects.filter((node) => node.pageId === secondPage)).toHaveLength(1);
    useProjectStore.getState().deletePage(secondPage);
    expect(useProjectStore.getState().project.activePageId).toBe(firstPage);
    expect(useProjectStore.getState().project.objects.every((node) => node.pageId === firstPage)).toBe(true);
  });
  it('becomes clean again when undo returns to the saved content', () => {
    useProjectStore.getState().addNode('mechanic');
    const id = useProjectStore.getState().project.objects[0].id;
    useProjectStore.getState().markSaved('C:\\Games\\design.gdd.json');
    useProjectStore.getState().updateNode(id, { title: 'Changed title' });
    expect(useProjectStore.getState().dirty).toBe(true);
    useProjectStore.getState().undo();
    expect(useProjectStore.getState().dirty).toBe(false);
  });
  it('tracks V3 detail fields through dirty state and undo', () => {
    useProjectStore.getState().addNode('quest');
    const id = useProjectStore.getState().project.objects[0].id;
    useProjectStore.getState().markSaved();
    useProjectStore.getState().updateNode(id, { status: 'validated', tags: ['ana görev'], designIntent: 'Oyuncuya yön verir.', properties: { trigger: 'Köye giriş' } });
    expect(useProjectStore.getState().project.objects[0]).toMatchObject({ status: 'validated', tags: ['ana görev'], properties: { trigger: 'Köye giriş' } });
    expect(useProjectStore.getState().dirty).toBe(true);
    useProjectStore.getState().undo();
    expect(useProjectStore.getState().project.objects[0].status).toBe('draft');
    expect(useProjectStore.getState().dirty).toBe(false);
  });
  it('duplicates independently and removes a node with its placement and relations', () => {
    useProjectStore.getState().addNode('mechanic'); useProjectStore.getState().addNode('ui');
    const [source, target] = useProjectStore.getState().project.objects; useProjectStore.getState().addRelation(source.id, target.id, 'affects');
    const undoBefore = useProjectStore.getState().undoStack.length; useProjectStore.getState().duplicateNode(source.id);
    const duplicate = useProjectStore.getState().project.objects.at(-1)!;
    expect(duplicate.id).not.toBe(source.id); expect(duplicate.kind).toBe(source.kind); expect(useProjectStore.getState().undoStack).toHaveLength(undoBefore + 1);
    useProjectStore.getState().removeNode(source.id);
    expect(useProjectStore.getState().project.objects.some((node) => node.id === source.id)).toBe(false);
    expect(useProjectStore.getState().project.placements.some((place) => place.nodeId === source.id)).toBe(false);
    expect(useProjectStore.getState().project.relations).toHaveLength(0);
  });
  it('clears a deleted node from selection and detail, and undo restores all linked data', () => {
    const store = useProjectStore.getState(); store.addNode('mechanic'); store.addNode('ui');
    const [source, target] = useProjectStore.getState().project.objects;
    store.addRelation(source.id, target.id, 'affects'); store.openDetail(source.id);
    const beforeRemoval = structuredClone(useProjectStore.getState().project);

    store.removeNode(source.id);
    expect(useProjectStore.getState()).toMatchObject({ selectedNodeId: undefined, detailNodeId: undefined });
    expect(useProjectStore.getState().project.objects.map((node) => node.id)).toEqual([target.id]);
    expect(useProjectStore.getState().project.placements.some((placement) => placement.nodeId === source.id)).toBe(false);
    expect(useProjectStore.getState().project.relations).toHaveLength(0);

    useProjectStore.getState().undo();
    expect(useProjectStore.getState().project).toEqual(beforeRemoval);
  });
});
