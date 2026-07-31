import type { ProjectModel } from './types';

export type ValidationSeverity = 'error' | 'warning';
export type ValidationIssue = { code: string; severity: ValidationSeverity; message: string; pageId?: string; nodeId?: string; relationId?: string };

export function validateProject(project: ProjectModel): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const pages = new Set(project.pages.map((page) => page.id));
  const nodes = new Map(project.objects.map((node) => [node.id, node]));
  const seenNodeIds = new Set<string>();
  const seenRelations = new Set<string>();
  const placed = new Set<string>();

  if (!pages.has(project.activePageId)) issues.push({ code: 'active-page-missing', severity: 'error', message: 'Aktif sayfa projede bulunmuyor.' });
  for (const node of project.objects) {
    if (seenNodeIds.has(node.id)) issues.push({ code: 'duplicate-node-id', severity: 'error', message: `Aynı öğe kimliği birden fazla kullanılmış: ${node.id}`, nodeId: node.id, pageId: node.pageId });
    seenNodeIds.add(node.id);
    if (!pages.has(node.pageId)) issues.push({ code: 'node-page-missing', severity: 'error', message: `${node.title} var olmayan bir sayfaya bağlı.`, nodeId: node.id, pageId: node.pageId });
  }
  for (const place of project.placements) {
    const node = nodes.get(place.nodeId);
    if (!node) issues.push({ code: 'orphan-placement', severity: 'warning', message: `Yerleşimi olan öğe bulunamadı: ${place.nodeId}`, nodeId: place.nodeId, pageId: place.pageId });
    else {
      placed.add(place.nodeId);
      if (place.pageId !== node.pageId) issues.push({ code: 'placement-page-mismatch', severity: 'error', message: `${node.title} yerleşimi farklı bir sayfaya bağlı.`, nodeId: node.id, pageId: node.pageId });
    }
  }
  for (const node of project.objects) if (!placed.has(node.id)) issues.push({ code: 'invisible-node', severity: 'warning', message: `${node.title} tuvalde görünmüyor.`, nodeId: node.id, pageId: node.pageId });
  for (const edge of project.relations) {
    const source = nodes.get(edge.source); const target = nodes.get(edge.target);
    if (!source || !target) issues.push({ code: 'broken-reference', severity: 'error', message: `Bağlantının kaynak veya hedef öğesi bulunamadı.`, relationId: edge.id, pageId: edge.pageId });
    if (edge.source === edge.target) issues.push({ code: 'self-edge', severity: 'warning', message: 'Bir öğe kendisine bağlanmış.', relationId: edge.id, nodeId: edge.source, pageId: edge.pageId });
    const signature = `${edge.pageId}:${edge.source}:${edge.target}:${edge.kind}`;
    if (seenRelations.has(signature)) issues.push({ code: 'duplicate-edge', severity: 'warning', message: 'Aynı tür bağlantı birden fazla kez tanımlanmış.', relationId: edge.id, pageId: edge.pageId });
    seenRelations.add(signature);
    if (source && target && (source.pageId !== edge.pageId || target.pageId !== edge.pageId)) issues.push({ code: 'cross-page-edge', severity: 'error', message: 'Bağlantı ve uçları aynı sayfada değil.', relationId: edge.id, pageId: edge.pageId });
  }

  const requires = project.relations.filter((edge) => edge.kind === 'requires' && nodes.has(edge.source) && nodes.has(edge.target));
  const adjacency = new Map<string, string[]>();
  for (const edge of requires) adjacency.set(edge.source, [...(adjacency.get(edge.source) ?? []), edge.target]);
  const visited = new Set<string>(); const stack = new Set<string>(); const cyclic = new Set<string>();
  const visit = (id: string) => { if (stack.has(id)) { cyclic.add(id); return; } if (visited.has(id)) return; visited.add(id); stack.add(id); for (const next of adjacency.get(id) ?? []) visit(next); stack.delete(id); };
  for (const id of nodes.keys()) visit(id);
  if (cyclic.size) issues.push({ code: 'requires-cycle', severity: 'error', message: '“Gerektirir” bağlantılarında döngü bulundu.', nodeId: [...cyclic][0], pageId: nodes.get([...cyclic][0])?.pageId });
  return issues;
}
