import { parseAndMigrateProject } from './project';
import { ProjectSchema, type ProjectModel } from './types';

const key = 'gdd-tool:project-snapshot';
const isTauri = () => typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
export type OpenedProject = { project: ProjectModel; path: string };

/** Recovery autosave never changes the explicit file's clean/dirty state. */
export async function saveRecoverySnapshot(project: ProjectModel): Promise<void> {
  const snapshot = ProjectSchema.parse(project);
  if (isTauri()) { const { invoke } = await import('@tauri-apps/api/core'); await invoke('save_project_snapshot', { snapshot }); return; }
  localStorage.setItem(key, JSON.stringify(snapshot));
}
export async function loadRecoverySnapshot(): Promise<ProjectModel | null> {
  let value: unknown = null;
  if (isTauri()) { const { invoke } = await import('@tauri-apps/api/core'); value = await invoke('load_project_snapshot'); }
  else { const raw = localStorage.getItem(key); value = raw ? JSON.parse(raw) : null; }
  return value ? parseAndMigrateProject(value) : null;
}
export async function openProjectFile(): Promise<OpenedProject | null> {
  if (!isTauri()) return null;
  const { invoke } = await import('@tauri-apps/api/core');
  const result = await invoke<{ snapshot: unknown; path: string } | null>('open_project_file');
  return result ? { project: parseAndMigrateProject(result.snapshot), path: result.path } : null;
}
export async function saveProjectFile(project: ProjectModel, path?: string, saveAs = false): Promise<string | null> {
  const snapshot = ProjectSchema.parse(project);
  if (!isTauri()) { localStorage.setItem(key, JSON.stringify(snapshot)); return path ?? 'browser:gdd-project.json'; }
  const { invoke } = await import('@tauri-apps/api/core');
  return invoke<string | null>('save_project_file', { snapshot, path: saveAs ? null : path ?? null });
}

// Previous names remain available for existing integrations.
export const saveProjectSnapshot = saveRecoverySnapshot;
export const loadProjectSnapshot = loadRecoverySnapshot;
