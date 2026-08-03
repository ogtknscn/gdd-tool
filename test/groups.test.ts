import { describe, expect, it } from 'vitest';
import { groupFrameGeometry, GROUP_FRAME_PADDING, GROUP_HEADER_HEIGHT, GROUP_NODE_HEIGHT, GROUP_NODE_WIDTH } from '../src/domain/groups';
import type { GddGroup } from '../src/domain/types';

describe('group helpers', () => {
  it('builds a padded frame from member placements on the same page', () => {
    const group: GddGroup = { id: 'g1', pageId: 'p1', title: 'Combat', color: '#7058dd', memberNodeIds: ['a', 'b'], collapsed: false };
    expect(groupFrameGeometry(group, [{ nodeId: 'a', pageId: 'p1', x: 100, y: 80 }, { nodeId: 'b', pageId: 'p1', x: 400, y: 260 }, { nodeId: 'c', pageId: 'p2', x: 0, y: 0 }])).toEqual({ x: 100 - GROUP_FRAME_PADDING, y: 80 - GROUP_FRAME_PADDING - GROUP_HEADER_HEIGHT, width: 400 + GROUP_NODE_WIDTH - 100 + GROUP_FRAME_PADDING * 2, height: 260 + GROUP_NODE_HEIGHT - 80 + GROUP_FRAME_PADDING * 2 + GROUP_HEADER_HEIGHT });
  });
  it('does not make a frame without visible members', () => { const group: GddGroup = { id: 'g1', pageId: 'p1', title: '', color: '#7058dd', memberNodeIds: ['missing'], collapsed: false }; expect(groupFrameGeometry(group, [])).toBeUndefined(); });
  it('reserves the title band above the first member card', () => { const group: GddGroup = { id: 'g1', pageId: 'p1', title: 'Combat', color: '#7058dd', memberNodeIds: ['a'], collapsed: false }; const frame = groupFrameGeometry(group, [{ nodeId: 'a', pageId: 'p1', x: 100, y: 80 }])!; expect(80 - frame.y).toBe(GROUP_FRAME_PADDING + GROUP_HEADER_HEIGHT); });
});
