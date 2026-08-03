import type { GddGroup, Placement } from './types';

export const GROUP_COLORS = ['#7058dd', '#19b8b2', '#e59647', '#e86e9b', '#62a0ef', '#83a963'] as const;
export const GROUP_FRAME_PADDING = 32;
// This domain reservation keeps member cards out of the controls/title band.
export const GROUP_HEADER_HEIGHT = 34;
export const GROUP_NODE_WIDTH = 210;
export const GROUP_NODE_HEIGHT = 110;

export type GroupFrame = { x: number; y: number; width: number; height: number };

export const uniqueGroupMemberIds = (ids: string[]) => [...new Set(ids)];

export const groupFrameGeometry = (group: GddGroup, placements: Placement[]): GroupFrame | undefined => {
  const members = new Set(group.memberNodeIds);
  const points = placements.filter((placement) => placement.pageId === group.pageId && members.has(placement.nodeId));
  if (!points.length) return undefined;

  const minX = Math.min(...points.map((point) => point.x));
  const minY = Math.min(...points.map((point) => point.y));
  const maxX = Math.max(...points.map((point) => point.x + GROUP_NODE_WIDTH));
  const maxY = Math.max(...points.map((point) => point.y + GROUP_NODE_HEIGHT));

  return {
    x: minX - GROUP_FRAME_PADDING,
    y: minY - GROUP_FRAME_PADDING - GROUP_HEADER_HEIGHT,
    width: maxX - minX + GROUP_FRAME_PADDING * 2,
    height: maxY - minY + GROUP_FRAME_PADDING * 2 + GROUP_HEADER_HEIGHT,
  };
};
