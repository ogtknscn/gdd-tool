import { useMemo } from 'react';
import { t, type Language } from './i18n';
import type { ProjectModel } from './types';

export type ValidationSeverity = 'error' | 'warning';
export type ValidationIssue = {
  code: string;
  severity: ValidationSeverity;
  message: string;
  pageId?: string;
  nodeId?: string;
  relationId?: string;
  groupId?: string;
};

export function validateProject(project: ProjectModel, language: Language): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const pages = new Set(project.pages.map((page) => page.id));
  const nodes = new Map(project.objects.map((node) => [node.id, node]));
  const groups = new Map(project.groups.map((group) => [group.id, group]));

  checkActivePage(project, pages, issues, language);
  checkNodes(project, pages, issues, language);
  const placed = checkPlacements(project, nodes, issues, language);
  checkOrphanNodes(project, placed, issues, language);
  checkRelations(project, nodes, issues, language);
  checkGroups(project, pages, nodes, groups, issues, language);
  checkGroupParentCycles(groups, issues, language);
  checkRequiresCycles(project, nodes, issues, language);

  return issues;
}

let cachedProject: ProjectModel | undefined;
let cachedLanguage: Language | undefined;
let cachedIssues: ValidationIssue[] = [];

/**
 * Shares one validateProject() pass across every consumer for the same
 * project reference and language. App, Canvas, and ValidationPanel each used
 * to run their own independent full validation pass on every project
 * change; project is replaced wholesale on each mutation, so caching by
 * reference collapses those three passes into one without needing prop
 * drilling or context.
 */
export function useValidationIssues(project: ProjectModel, language: Language): ValidationIssue[] {
  return useMemo(() => {
    if (project !== cachedProject || language !== cachedLanguage) {
      cachedProject = project;
      cachedLanguage = language;
      cachedIssues = validateProject(project, language);
    }
    return cachedIssues;
  }, [project, language]);
}

function checkActivePage(project: ProjectModel, pages: Set<string>, issues: ValidationIssue[], language: Language) {
  if (!pages.has(project.activePageId)) {
    issues.push({ code: 'active-page-missing', severity: 'error', message: t(language, 'validation.msg.activePageMissing') });
  }
}

function checkNodes(project: ProjectModel, pages: Set<string>, issues: ValidationIssue[], language: Language) {
  const seenNodeIds = new Set<string>();
  for (const node of project.objects) {
    if (seenNodeIds.has(node.id)) {
      issues.push({ code: 'duplicate-node-id', severity: 'error', message: t(language, 'validation.msg.duplicateNodeId', { id: node.id }), nodeId: node.id, pageId: node.pageId });
    }
    seenNodeIds.add(node.id);
    if (!pages.has(node.pageId)) {
      issues.push({ code: 'node-page-missing', severity: 'error', message: t(language, 'validation.msg.nodePageMissing', { title: node.title }), nodeId: node.id, pageId: node.pageId });
    }
  }
}

function checkPlacements(project: ProjectModel, nodes: Map<string, ProjectModel['objects'][number]>, issues: ValidationIssue[], language: Language): Set<string> {
  const placed = new Set<string>();
  for (const place of project.placements) {
    const node = nodes.get(place.nodeId);
    if (!node) {
      issues.push({ code: 'orphan-placement', severity: 'warning', message: t(language, 'validation.msg.orphanPlacement', { id: place.nodeId }), nodeId: place.nodeId, pageId: place.pageId });
      continue;
    }
    placed.add(place.nodeId);
    if (place.pageId !== node.pageId) {
      issues.push({ code: 'placement-page-mismatch', severity: 'error', message: t(language, 'validation.msg.placementPageMismatch', { title: node.title }), nodeId: node.id, pageId: node.pageId });
    }
  }
  return placed;
}

function checkOrphanNodes(project: ProjectModel, placed: Set<string>, issues: ValidationIssue[], language: Language) {
  for (const node of project.objects) {
    if (!placed.has(node.id)) {
      issues.push({ code: 'invisible-node', severity: 'warning', message: t(language, 'validation.msg.invisibleNode', { title: node.title }), nodeId: node.id, pageId: node.pageId });
    }
  }
}

function checkRelations(project: ProjectModel, nodes: Map<string, ProjectModel['objects'][number]>, issues: ValidationIssue[], language: Language) {
  const seenRelations = new Set<string>();
  for (const edge of project.relations) {
    const source = nodes.get(edge.source);
    const target = nodes.get(edge.target);
    if (!source || !target) {
      issues.push({ code: 'broken-reference', severity: 'error', message: t(language, 'validation.msg.brokenReference'), relationId: edge.id, pageId: edge.pageId });
    }
    if (edge.source === edge.target) {
      issues.push({ code: 'self-edge', severity: 'warning', message: t(language, 'validation.msg.selfEdge'), relationId: edge.id, nodeId: edge.source, pageId: edge.pageId });
    }
    const signature = `${edge.pageId}:${edge.source}:${edge.target}:${edge.kind}`;
    if (seenRelations.has(signature)) {
      issues.push({ code: 'duplicate-edge', severity: 'warning', message: t(language, 'validation.msg.duplicateEdge'), relationId: edge.id, pageId: edge.pageId });
    }
    seenRelations.add(signature);
    if (source && target && (source.pageId !== edge.pageId || target.pageId !== edge.pageId)) {
      issues.push({ code: 'cross-page-edge', severity: 'error', message: t(language, 'validation.msg.crossPageEdge'), relationId: edge.id, pageId: edge.pageId });
    }
  }
}

function checkGroups(
  project: ProjectModel,
  pages: Set<string>,
  nodes: Map<string, ProjectModel['objects'][number]>,
  groups: Map<string, ProjectModel['groups'][number]>,
  issues: ValidationIssue[],
  language: Language,
) {
  for (const group of project.groups) {
    if (!pages.has(group.pageId)) {
      issues.push({ code: 'group-page-missing', severity: 'error', message: t(language, 'validation.msg.groupPageMissing', { title: group.title }), groupId: group.id, pageId: group.pageId });
    }
    if (!group.title.trim()) {
      issues.push({ code: 'blank-group-title', severity: 'warning', message: t(language, 'validation.msg.blankGroupTitle'), groupId: group.id, pageId: group.pageId });
    }

    const members = new Set<string>();
    for (const nodeId of group.memberNodeIds) {
      if (members.has(nodeId)) {
        issues.push({ code: 'duplicate-group-member', severity: 'warning', message: t(language, 'validation.msg.duplicateGroupMember', { id: nodeId }), groupId: group.id, nodeId, pageId: group.pageId });
      }
      members.add(nodeId);
      const node = nodes.get(nodeId);
      if (!node || node.pageId !== group.pageId) {
        issues.push({ code: 'invalid-group-member', severity: 'error', message: t(language, 'validation.msg.invalidGroupMember'), groupId: group.id, nodeId, pageId: group.pageId });
      }
    }

    if (group.parentGroupId && (!groups.has(group.parentGroupId) || groups.get(group.parentGroupId)?.pageId !== group.pageId)) {
      issues.push({ code: 'invalid-group-parent', severity: 'error', message: t(language, 'validation.msg.invalidGroupParent'), groupId: group.id, pageId: group.pageId });
    }
  }
}

function checkGroupParentCycles(groups: Map<string, ProjectModel['groups'][number]>, issues: ValidationIssue[], language: Language) {
  const visited = new Set<string>();
  const stack = new Set<string>();

  const visit = (id: string) => {
    if (stack.has(id)) {
      issues.push({ code: 'group-parent-cycle', severity: 'error', message: t(language, 'validation.msg.groupParentCycle'), groupId: id, pageId: groups.get(id)?.pageId });
      return;
    }
    if (visited.has(id)) return;
    visited.add(id);
    stack.add(id);
    const parentId = groups.get(id)?.parentGroupId;
    if (parentId && groups.has(parentId)) visit(parentId);
    stack.delete(id);
  };

  for (const id of groups.keys()) visit(id);
}

function checkRequiresCycles(project: ProjectModel, nodes: Map<string, ProjectModel['objects'][number]>, issues: ValidationIssue[], language: Language) {
  const requires = project.relations.filter((edge) => edge.kind === 'requires' && nodes.has(edge.source) && nodes.has(edge.target));
  const adjacency = new Map<string, string[]>();
  for (const edge of requires) adjacency.set(edge.source, [...(adjacency.get(edge.source) ?? []), edge.target]);

  const visited = new Set<string>();
  const stack = new Set<string>();
  const cyclic = new Set<string>();

  const visit = (id: string) => {
    if (stack.has(id)) {
      cyclic.add(id);
      return;
    }
    if (visited.has(id)) return;
    visited.add(id);
    stack.add(id);
    for (const next of adjacency.get(id) ?? []) visit(next);
    stack.delete(id);
  };

  for (const id of nodes.keys()) visit(id);

  // NOTE: only the first cyclic node is reported today, so a project with
  // multiple independent "requires" cycles will only surface one of them.
  if (cyclic.size) {
    const firstCyclicId = [...cyclic][0];
    issues.push({ code: 'requires-cycle', severity: 'error', message: t(language, 'validation.msg.requiresCycle'), nodeId: firstCyclicId, pageId: nodes.get(firstCyclicId)?.pageId });
  }
}
