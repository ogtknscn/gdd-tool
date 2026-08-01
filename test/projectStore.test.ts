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
  it('moves every member of a group in one undoable operation', () => {
    const store = useProjectStore.getState(); store.addNode('mechanic'); store.addNode('entity'); const [first, second] = useProjectStore.getState().project.objects;
    store.createGroup('Sistem', '#7058dd', [first.id, second.id]); const group = useProjectStore.getState().project.groups[0]; const before = useProjectStore.getState().project.placements.map((place) => ({ ...place })); const undoBefore = useProjectStore.getState().undoStack.length;
    store.moveGroup(group.id, { x: 80, y: -40 }); const after = useProjectStore.getState().project.placements;
    expect(after.map((place, index) => ({ x: place.x - before[index].x, y: place.y - before[index].y }))).toEqual([{ x: 80, y: -40 }, { x: 80, y: -40 }]); expect(useProjectStore.getState().undoStack).toHaveLength(undoBefore + 1);
  });
  it('updates checklist items atomically and assigns fresh ids when duplicating', () => {
    const store = useProjectStore.getState(); store.addNode('mechanic'); const node = useProjectStore.getState().project.objects[0]; const undoBefore = useProjectStore.getState().undoStack.length;
    store.addChecklistItem(node.id, 'Kapıyı test et'); const item = useProjectStore.getState().project.objects[0].checklist[0]; store.toggleChecklistItem(node.id, item.id); store.updateChecklistItem(node.id, item.id, 'Kapıyı yeniden test et');
    expect(useProjectStore.getState().project.objects[0].checklist[0]).toMatchObject({ text: 'Kapıyı yeniden test et', done: true });
    expect(useProjectStore.getState().undoStack).toHaveLength(undoBefore + 3); store.duplicateNode(node.id); const duplicate = useProjectStore.getState().project.objects.at(-1)!; expect(duplicate.checklist[0].id).not.toBe(item.id);
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
  it('removes playground items that belong to a deleted page', () => {
    const store = useProjectStore.getState(); const firstPage = store.project.activePageId;
    store.addPage('Combat'); const secondPage = useProjectStore.getState().project.activePageId;
    useProjectStore.getState().addPlaygroundItem('sticky', 'Not');
    expect(useProjectStore.getState().project.playgroundItems).toHaveLength(1);
    useProjectStore.getState().deletePage(secondPage);
    expect(useProjectStore.getState().project.activePageId).toBe(firstPage);
    expect(useProjectStore.getState().project.playgroundItems).toHaveLength(0);
  });
  it('moves a playground item to a new position, same as dragging a node card', () => {
    useProjectStore.getState().addPlaygroundItem('sticky', 'Not');
    const item = useProjectStore.getState().project.playgroundItems[0];
    useProjectStore.getState().movePlaygroundItem(item.id, 420, 260);
    expect(useProjectStore.getState().project.playgroundItems[0]).toMatchObject({ id: item.id, x: 420, y: 260 });
  });
  it('adds a playground image item with its data URL and an optional caption', () => {
    useProjectStore.getState().addPlaygroundImage('data:image/png;base64,AAA=', 'Reference shot');
    const item = useProjectStore.getState().project.playgroundItems[0];
    expect(item).toMatchObject({ type: 'image', imageData: 'data:image/png;base64,AAA=', text: 'Reference shot' });
  });
  it('captures a low-friction idea onto its own page without switching the active page', () => {
    const store = useProjectStore.getState(); const activeBefore = store.project.activePageId;
    store.addIdea('Yeni bir güçlenme fikri\nDetay satırı');
    const state = useProjectStore.getState();
    expect(state.project.activePageId).toBe(activeBefore);
    const ideaPage = state.project.pages.find((page) => page.title === 'Fikirler')!;
    expect(ideaPage).toBeDefined();
    const idea = state.project.objects.find((node) => node.pageId === ideaPage.id)!;
    expect(idea).toMatchObject({ kind: 'quest', title: 'Yeni bir güçlenme fikri', tags: ['fikir'] });
    expect(idea.specification).toBe('Yeni bir güçlenme fikri\nDetay satırı');
  });
  it('reuses the existing Fikirler page for a second idea instead of creating a duplicate', () => {
    const store = useProjectStore.getState();
    store.addIdea('Birinci fikir'); store.addIdea('İkinci fikir');
    const pages = useProjectStore.getState().project.pages.filter((page) => page.title === 'Fikirler');
    expect(pages).toHaveLength(1);
    expect(useProjectStore.getState().project.objects.filter((node) => node.pageId === pages[0].id)).toHaveLength(2);
  });
  it('ignores an empty idea submission', () => {
    const store = useProjectStore.getState(); const before = useProjectStore.getState().undoStack.length;
    store.addIdea('   ');
    expect(useProjectStore.getState().undoStack).toHaveLength(before);
    expect(useProjectStore.getState().project.pages.some((page) => page.title === 'Fikirler')).toBe(false);
  });
  it('caps the undo stack instead of growing it unbounded on long sessions', () => {
    const store = useProjectStore.getState(); store.addNode('mechanic');
    const id = useProjectStore.getState().project.objects[0].id;
    for (let i = 0; i < 150; i += 1) useProjectStore.getState().updateNode(id, { summary: `v${i}` });
    expect(useProjectStore.getState().undoStack.length).toBeLessThanOrEqual(100);
    expect(useProjectStore.getState().project.objects[0].summary).toBe('v149');
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
