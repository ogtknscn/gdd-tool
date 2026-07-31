import type { CSSProperties } from 'react';
import type { NodeProps } from '@xyflow/react';

export type GddGroupFrameData = { title: string; color: string };
export function GddGroupFrame({ data }: NodeProps) {
  const frame = data as GddGroupFrameData;
  return <div className="gdd-group-frame" style={{ '--group-color': frame.color } as CSSProperties}><span>{frame.title || 'İsimsiz grup'}</span></div>;
}
