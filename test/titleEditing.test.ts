import { beforeEach, describe, expect, it } from 'vitest';
import { normalizeCommittedTitle, titleKeyAction } from '../src/components/CommitTitleInput';
import { useProjectStore } from '../src/stores/projectStore';

describe('commit title editing', () => {
  beforeEach(() => useProjectStore.getState().applyTemplate('blank'));
  it('trims committed values and supplies the empty fallback', () => {
    expect(normalizeCommittedTitle('  Core Loop  ')).toBe('Core Loop');
    expect(normalizeCommittedTitle('   ')).toBe('İsimsiz öğe');
  });
  it('does not treat IME Enter or Escape as edit commands', () => {
    expect(titleKeyAction('Enter', true)).toBe('none');
    expect(titleKeyAction('Escape', true)).toBe('none');
    expect(titleKeyAction('Enter', false)).toBe('commit');
    expect(titleKeyAction('Escape', false)).toBe('cancel');
  });
  it('one committed title is one undo step', () => {
    useProjectStore.getState().addNode('mechanic'); const id = useProjectStore.getState().project.objects[0].id;
    useProjectStore.getState().markSaved(); const undoBefore = useProjectStore.getState().undoStack.length;
    useProjectStore.getState().updateNode(id, { title: normalizeCommittedTitle('  Yeni Başlık  ') });
    expect(useProjectStore.getState().undoStack).toHaveLength(undoBefore + 1);
    expect(useProjectStore.getState().project.objects[0].title).toBe('Yeni Başlık');
    useProjectStore.getState().undo();
    expect(useProjectStore.getState().project.objects[0].title).toBe('Yeni öğe');
  });
});
