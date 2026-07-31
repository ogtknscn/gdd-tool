import { describe, expect, it } from 'vitest';
import type { Node } from '@xyflow/react';
import { createObject } from '../src/domain/project';
import { reconcileFlowNodes } from '../src/components/Canvas';
import type { GddCardData } from '../src/components/GddNodeCard';

const makeNode = (id: string, x: number, y: number): Node<GddCardData> => ({
  id, type: 'gdd', position: { x, y }, data: { item: { ...createObject('mechanic', 'page-1'), id }, density: 'standard', invalid: false },
});

describe('canvas node reconciliation', () => {
  it('keeps an active pointer drag position while syncing other project changes', () => {
    const current = [makeNode('dragged', 310, 180), makeNode('other', 90, 40)];
    const incoming = [makeNode('dragged', 180, 180), makeNode('other', 140, 60)];

    expect(reconcileFlowNodes(current, incoming, 'dragged').map((node) => node.position)).toEqual([{ x: 310, y: 180 }, { x: 140, y: 60 }]);
  });

  it('uses persisted positions after the pointer drag ends and removes absent nodes', () => {
    const current = [makeNode('dragged', 310, 180), makeNode('removed', 90, 40)];
    const incoming = [makeNode('dragged', 310, 180)];

    expect(reconcileFlowNodes(current, incoming)).toEqual(incoming);
  });
});
