import type { CSSProperties } from 'react';
import type { NodeProps } from '@xyflow/react';

export type GddGroupFrameData = { title: string; color: string; focused: boolean; onToggleFocus: () => void };
export function GddGroupFrame({ data }: NodeProps) {
  const frame = data as GddGroupFrameData;
  const title = frame.title || 'İsimsiz grup';
  return <div className={`gdd-group-frame ${frame.focused ? 'focused' : ''}`} style={{ '--group-color': frame.color } as CSSProperties}>
    <button type="button" className="nodrag nopan group-frame-toggle" aria-pressed={frame.focused} aria-label={`${title} grubuna ${frame.focused ? 'odağı kapat' : 'odaklan'}`} onClick={frame.onToggleFocus}>{title}</button>
  </div>;
}
