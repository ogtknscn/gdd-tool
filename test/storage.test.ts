import { beforeEach, describe, expect, it } from 'vitest';
import { emptyProject } from '../src/domain/project';
import { clearRecoverySnapshot, loadRecoverySnapshot, loadRecentProjects, saveRecoverySnapshot, saveProjectFile } from '../src/domain/storage';

describe('development storage fallback', () => {
  beforeEach(() => localStorage.clear());
  it('round-trips a project snapshot', async () => {
    const project = emptyProject(); project.title = 'Test project';
    await saveRecoverySnapshot(project);
    await expect(loadRecoverySnapshot()).resolves.toEqual(project);
  });
  it('clears recovery after an explicit save while retaining browser fallback', async () => {
    const project = emptyProject(); await saveRecoverySnapshot(project); await clearRecoverySnapshot(); await expect(loadRecoverySnapshot()).resolves.toBeNull(); await saveProjectFile(project, 'browser:test.gdd.json'); await expect(loadRecentProjects()).resolves.toEqual([]);
  });
});
