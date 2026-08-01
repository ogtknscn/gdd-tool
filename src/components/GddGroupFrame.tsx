import type { CSSProperties } from 'react';
import type { NodeProps } from '@xyflow/react';
import { useT } from '../stores/uiStore';

export type GddGroupFrameData = { title: string; color: string; focused: boolean; collapsed: boolean; memberCount: number; onToggleFocus: () => void; onToggleCollapsed: () => void };
export function GddGroupFrame({ data }: NodeProps) {
  const t = useT();
  const frame = data as GddGroupFrameData;
  const title = frame.title || t('outline.unnamedGroup');
  return <div className={`gdd-group-frame ${frame.focused ? 'focused' : ''}`} style={{ '--group-color': frame.color } as CSSProperties}>
    <button type="button" className="nodrag nopan group-frame-toggle" aria-pressed={frame.focused} aria-label={t(frame.focused ? 'groupFrame.focusOffAria' : 'groupFrame.focusOnAria', { title })} onClick={frame.onToggleFocus}>{title}</button>
    <button type="button" className="nodrag nopan group-collapse-toggle" aria-pressed={frame.collapsed} aria-label={t(frame.collapsed ? 'groupFrame.expandAria' : 'groupFrame.collapseAria', { title })} onClick={frame.onToggleCollapsed}>{frame.collapsed ? `+ ${frame.memberCount}` : '−'}</button>
  </div>;
}
