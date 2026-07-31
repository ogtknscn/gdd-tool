import { emptyProject } from './project';
import type { GddEdge, GddNode, Placement, ProjectModel } from './types';

export type TemplateId = 'blank' | 'core-loop' | 'quest';
export type ProjectTemplate = { id: TemplateId; name: string; description: string; create: () => ProjectModel };
const node = (id: string, pageId: string, kind: GddNode['kind'], title: string, summary = ''): GddNode => ({ id, pageId, kind, title, summary, status: 'draft', tags: [], designIntent: '', playerExperience: '', specification: '', testNotes: '', properties: {} });
const edge = (id: string, pageId: string, source: string, target: string, kind: GddEdge['kind']): GddEdge => ({ id, pageId, source, target, kind });
const placement = (nodeId: string, pageId: string, x: number, y: number): Placement => ({ nodeId, pageId, x, y });
const template = (title: string, definitions: Array<[string, GddNode['kind'], string, string?, number?, number?]>, edges: Array<[string, string, string, GddEdge['kind']]>): ProjectModel => {
  const project = emptyProject(); const pageId = project.activePageId;
  return { ...project, title, objects: definitions.map(([id, kind, name, summary]) => node(id, pageId, kind, name, summary)), placements: definitions.map(([id,,,, x = 0, y = 0]) => placement(id, pageId, x, y)), relations: edges.map(([id, source, target, kind]) => edge(id, pageId, source, target, kind)) };
};

export const templates: ProjectTemplate[] = [
  { id: 'blank', name: 'Boş çalışma alanı', description: 'Fikirleri serbestçe yerleştirin.', create: emptyProject },
  { id: 'core-loop', name: 'Core loop', description: 'Oyuncu döngüsünü mekanik, ödül ve arayüz ile kurun.', create: () => template('Core loop', [['explore','level','Keşfet','Oyuncu alanı inceler.',0,120], ['combat','mechanic','Mücadele','Temel karşılaşma döngüsü.',260,120], ['reward','entity','Ödül','Kaynak veya ilerleme ödülü.',520,120], ['hud','ui','Durum HUD','Kaynakları gösterir.',260,330]], [['e1','explore','combat','requires'], ['e2','combat','reward','produces'], ['e3','hud','combat','affects']]) },
  { id: 'quest', name: 'Quest flow', description: 'Görev adımlarını, arayüzü ve ödülü bağlayın.', create: () => template('Quest flow', [['start','quest','Görevi al','',0,100], ['objective','quest','Hedefi tamamla','',260,100], ['reward','entity','Ödülü al','',520,100], ['journal','ui','Quest journal','',260,310]], [['q1','start','objective','requires'], ['q2','objective','reward','produces'], ['q3','journal','objective','affects']]) },
];
export const findTemplate = (id: TemplateId) => templates.find((template) => template.id === id)!;
