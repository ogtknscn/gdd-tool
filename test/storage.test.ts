import { beforeEach, describe, expect, it } from 'vitest';
import { emptyProject } from '../src/domain/project';
import { loadProjectSnapshot, saveProjectSnapshot } from '../src/domain/storage';

describe('development storage fallback', () => {
  beforeEach(() => localStorage.clear());
  it('round-trips a project snapshot', async () => {
    const project = emptyProject(); project.title = 'Test project';
    await saveProjectSnapshot(project);
    await expect(loadProjectSnapshot()).resolves.toEqual(project);
  });
});
