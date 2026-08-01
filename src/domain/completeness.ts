import { typeFields } from './nodeFields';
import type { GddNode, ProjectModel } from './types';

const LONG_FIELD_KEYS: Array<keyof Pick<GddNode, 'designIntent' | 'playerExperience' | 'specification' | 'testNotes'>> =
  ['designIntent', 'playerExperience', 'specification', 'testNotes'];

// A card's readiness score: how much of the fields a designer would actually
// fill in are filled in, plus checklist completion and validated status.
// Every check is weighted equally on purpose - it is a coverage signal, not a
// quality judgement of any single field.
export function nodeCompleteness(node: GddNode): number {
  const checks = [
    Boolean(node.summary.trim()),
    ...LONG_FIELD_KEYS.map((key) => Boolean(node[key].trim())),
    // Field *keys* (not labels) are identical across languages by design -
    // see nodeFields.ts - so which language we ask for here doesn't matter.
    ...typeFields(node.kind, 'tr').map((field) => Boolean(node.properties[field.key]?.trim())),
    node.status === 'validated',
    node.checklist.length === 0 || node.checklist.every((item) => item.done),
  ];
  return checks.filter(Boolean).length / checks.length;
}

export type PageReadiness = { pageId: string; nodeCount: number; averageCompleteness: number; validatedCount: number; openChecklistItems: number };

export function pageReadiness(project: ProjectModel, pageId: string): PageReadiness {
  const nodes = project.objects.filter((node) => node.pageId === pageId);
  const openChecklistItems = nodes.reduce((sum, node) => sum + node.checklist.filter((item) => !item.done).length, 0);
  const validatedCount = nodes.filter((node) => node.status === 'validated').length;
  const averageCompleteness = nodes.length ? nodes.reduce((sum, node) => sum + nodeCompleteness(node), 0) / nodes.length : 0;
  return { pageId, nodeCount: nodes.length, averageCompleteness, validatedCount, openChecklistItems };
}

// Red -> yellow -> green, matching the app's existing danger/warning/success
// palette (see --color-danger/--color-warning and the "success" toast border
// in styles.css) rather than inventing a new color language for this feature.
export function readinessColor(score: number): string {
  const clamped = Math.max(0, Math.min(1, score));
  const [from, to, t] = clamped < 0.5
    ? [[224, 85, 92], [229, 182, 74], clamped * 2]
    : [[229, 182, 74], [112, 201, 135], (clamped - 0.5) * 2];
  const mix = (a: number, b: number) => Math.round(a + (b - a) * t);
  return `rgb(${mix(from[0], to[0])}, ${mix(from[1], to[1])}, ${mix(from[2], to[2])})`;
}
