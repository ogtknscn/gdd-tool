import { beforeEach, describe, expect, it } from 'vitest';
import { emptyProject } from '../src/domain/project';
import { clearRecoverySnapshot, loadProjectSnapshot, loadRecentProjects, saveProjectSnapshot, saveProjectFile } from '../src/domain/storage';

describe('development storage fallback', () => {
  beforeEach(() => localStorage.clear());
  it('round-trips a project snapshot', async () => {
    const project = emptyProject(); project.title = 'Test project';
    await saveProjectSnapshot(project);
    await expect(loadProjectSnapshot()).resolves.toEqual(project);
  });
  it('clears recovery after an explicit save while retaining browser fallback', async () => {
    const project = emptyProject(); await saveProjectSnapshot(project); await clearRecoverySnapshot(); await expect(loadProjectSnapshot()).resolves.toBeNull(); await saveProjectFile(project, 'browser:test.gdd.json'); await expect(loadRecentProjects()).resolves.toEqual([]);
  });
});
