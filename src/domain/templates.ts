import { emptyProject } from './project';
import type { GddEdge, GddGroup, GddNode, Placement, ProjectModel } from './types';

export type TemplateId =
  | 'blank'
  | 'core-loop'
  | 'quest'
  | 'puzzle-level'
  | 'puzzle-tutorial'
  | 'combat-encounter'
  | 'economy-progression'
  | 'branching-narrative'
  | 'ui-flow'
  | 'roguelite-run-loop';

export type ProjectTemplate = {
  id: TemplateId;
  name: string;
  description: string;
  category: string;
  useCase: string;
  startingCounts: string;
  preview: string;
  create: () => ProjectModel;
};

// [id, kind, title, summary?, x?, y?]
type NodeDefinition = [id: string, kind: GddNode['kind'], title: string, summary?: string, x?: number, y?: number];
// [id, sourceId, targetId, kind]
type EdgeDefinition = [id: string, source: string, target: string, kind: GddEdge['kind']];
// [id, title, color, memberNodeIds]
type GroupDefinition = [id: string, title: string, color: string, members: string[]];

const node = (id: string, pageId: string, kind: GddNode['kind'], title: string, summary = ''): GddNode => ({
  id, pageId, kind, title, summary,
  status: 'draft', tags: [], designIntent: '', playerExperience: '', specification: '', testNotes: '',
  properties: {}, checklist: [],
});

const edge = (id: string, pageId: string, source: string, target: string, kind: GddEdge['kind']): GddEdge => ({
  id, pageId, source, target, kind, customLabel: '',
});

const placement = (nodeId: string, pageId: string, x: number, y: number): Placement => ({ nodeId, pageId, x, y });

function template(
  title: string,
  definitions: NodeDefinition[],
  edges: EdgeDefinition[],
  groups: GroupDefinition[] = [],
): ProjectModel {
  const project = emptyProject();
  const pageId = project.activePageId;
  return {
    ...project,
    title,
    objects: definitions.map(([id, kind, name, summary]) => node(id, pageId, kind, name, summary)),
    placements: definitions.map(([id, , , , x = 0, y = 0]) => placement(id, pageId, x, y)),
    relations: edges.map(([id, source, target, kind]) => edge(id, pageId, source, target, kind)),
    groups: groups.map(([id, groupTitle, color, memberNodeIds]) => ({
      id, pageId, title: groupTitle, color, memberNodeIds, collapsed: false,
    } satisfies GddGroup)),
  };
}

// Same as template(), plus a starter checklist on the first node and a
// descriptive customLabel on the first relation, to model how a filled-in
// project should look rather than a bare skeleton.
function guidedTemplate(
  title: string,
  definitions: NodeDefinition[],
  edges: EdgeDefinition[],
  groups: GroupDefinition[],
  checklist: string[],
  firstRelationLabel: string,
): ProjectModel {
  const project = template(title, definitions, edges, groups);
  return {
    ...project,
    objects: project.objects.map((item, index) =>
      index === 0
        ? { ...item, checklist: checklist.map((text, itemIndex) => ({ id: `${item.id}-check-${itemIndex + 1}`, text, done: false })) }
        : item,
    ),
    relations: project.relations.map((item, index) => (index === 0 ? { ...item, customLabel: firstRelationLabel } : item)),
  };
}

export const templates: ProjectTemplate[] = [
  {
    id: 'blank', name: 'Boş çalışma alanı', description: 'Fikirleri serbestçe yerleştirin.',
    category: 'Başlangıç', useCase: 'Sıfırdan özgür tasarım', startingCounts: '0 öğe', preview: 'Serbest tuval',
    create: emptyProject,
  },
  {
    id: 'core-loop', name: 'Core loop', description: 'Oyuncu döngüsünü mekanik, ödül ve arayüz ile kurun.',
    category: 'Sistem', useCase: 'Temel oyun döngüsü', startingCounts: '4 öğe · 3 bağlantı', preview: 'Keşfet → Mücadele → Ödül',
    create: () => template(
      'Core loop',
      [
        ['explore', 'level', 'Keşfet', 'Oyuncu alanı inceler.', 0, 120],
        ['combat', 'mechanic', 'Mücadele', 'Temel karşılaşma döngüsü.', 260, 120],
        ['reward', 'entity', 'Ödül', 'Kaynak veya ilerleme ödülü.', 520, 120],
        ['hud', 'ui', 'Durum HUD', 'Kaynakları gösterir.', 260, 330],
      ],
      [
        ['e1', 'explore', 'combat', 'requires'],
        ['e2', 'combat', 'reward', 'produces'],
        ['e3', 'hud', 'combat', 'affects'],
      ],
    ),
  },
  {
    id: 'quest', name: 'Quest flow', description: 'Görev adımlarını, arayüzü ve ödülü bağlayın.',
    category: 'İçerik', useCase: 'Görev akışı', startingCounts: '4 öğe · 3 bağlantı', preview: 'Al → Tamamla → Ödül',
    create: () => template(
      'Quest flow',
      [
        ['start', 'quest', 'Görevi al', '', 0, 100],
        ['objective', 'quest', 'Hedefi tamamla', '', 260, 100],
        ['reward', 'entity', 'Ödülü al', '', 520, 100],
        ['journal', 'ui', 'Quest journal', '', 260, 310],
      ],
      [
        ['q1', 'start', 'objective', 'requires'],
        ['q2', 'objective', 'reward', 'produces'],
        ['q3', 'journal', 'objective', 'affects'],
      ],
    ),
  },
  {
    id: 'puzzle-level', name: 'Puzzle level design', description: 'Kural, state, keşif ve çözüm akışını birlikte kurun.',
    category: 'Puzzle', useCase: 'Tekil puzzle seviyesi', startingCounts: '9 öğe · 9 bağlantı · 3 grup', preview: 'Kural → State → Çözüm',
    create: () => template(
      'Puzzle level design',
      [
        ['verb', 'mechanic', 'Oyuncu fiili', 'Oyuncunun deneyebileceği temel hareket.', 0, 100],
        ['rule', 'mechanic', 'Temel kural', 'Puzzle mantığını açıklar.', 260, 100],
        ['constraint', 'mechanic', 'Kısıt', 'Kolay çözümleri sınırlar.', 520, 100],
        ['state', 'entity', 'Puzzle state', 'Dünyadaki güncel puzzle durumu.', 260, 290],
        ['hint', 'ui', 'İpucu', 'Oyuncuya okunabilir geri bildirim.', 0, 500],
        ['solution', 'quest', 'Çözüm adımı', 'Beklenen çözüm davranışı.', 260, 500],
        ['success', 'quest', 'Başarı koşulu', 'Puzzle tamamlanma kontrolü.', 520, 500],
        ['reset', 'mechanic', 'Başarısızlık / reset', 'Güvenli yeniden deneme kuralı.', 520, 290],
        ['reward', 'entity', 'Açılan içerik', 'Başarı sonrası ödül veya açılan yol.', 780, 500],
      ],
      [
        ['p1', 'verb', 'state', 'affects'],
        ['p2', 'rule', 'state', 'requires'],
        ['p3', 'constraint', 'solution', 'requires'],
        ['p4', 'state', 'hint', 'tested_by'],
        ['p5', 'hint', 'solution', 'affects'],
        ['p6', 'solution', 'success', 'requires'],
        ['p7', 'state', 'reset', 'affects'],
        ['p8', 'reset', 'state', 'affects'],
        ['p9', 'success', 'reward', 'produces'],
      ],
      [
        ['rules', 'Girdi ve kurallar', '#7058dd', ['verb', 'rule', 'constraint']],
        ['state-group', 'State değişimleri', '#19b8b2', ['state', 'reset']],
        ['discovery', 'Oyuncu keşfi', '#e59647', ['hint', 'solution', 'success', 'reward']],
      ],
    ),
  },
  {
    id: 'puzzle-tutorial', name: 'Puzzle tutorial sequence', description: 'Kuralı öğretip kontrollü deneme ve bağımsız uygulamaya taşıyın.',
    category: 'Puzzle', useCase: 'Puzzle onboarding', startingCounts: '7 öğe · 7 bağlantı · 3 grup', preview: 'Göster → Dene → Ustalaş',
    create: () => template(
      'Puzzle tutorial sequence',
      [
        ['introduce', 'ui', 'Kuralı göster', 'Kuralın ilk, sade açıklaması.', 0, 100],
        ['guided', 'quest', 'Yönlendirilmiş deneme', 'Oyuncu ilk adımı güvenle uygular.', 260, 100],
        ['feedback', 'ui', 'Anlık geri bildirim', 'Doğru ve yanlış sonucu görünür kılar.', 520, 100],
        ['challenge', 'level', 'Serbest challenge', 'Kuralın bağımsız uygulaması.', 780, 100],
        ['state', 'entity', 'Tutorial state', 'Öğrenme ilerlemesini tutar.', 260, 320],
        ['reset', 'mechanic', 'Yumuşak reset', 'Hata sonrası anlaşılır geri dönüş.', 520, 320],
        ['mastery', 'quest', 'Ustalık kontrolü', 'Oyuncunun kuralı anladığını doğrular.', 780, 320],
      ],
      [
        ['t1', 'introduce', 'guided', 'requires'],
        ['t2', 'guided', 'feedback', 'tested_by'],
        ['t3', 'feedback', 'state', 'affects'],
        ['t4', 'state', 'challenge', 'requires'],
        ['t5', 'challenge', 'mastery', 'requires'],
        ['t6', 'feedback', 'reset', 'affects'],
        ['t7', 'reset', 'guided', 'affects'],
      ],
      [
        ['teach', 'Öğret', '#7058dd', ['introduce', 'guided', 'feedback']],
        ['practice', 'Deneme state’i', '#19b8b2', ['state', 'reset']],
        ['mastery-group', 'Bağımsız uygulama', '#e59647', ['challenge', 'mastery']],
      ],
    ),
  },
  {
    id: 'combat-encounter', name: 'Combat encounter', description: 'Karşılaşma ritmi, düşman davranışı ve ödül döngüsü.',
    category: 'Savaş', useCase: 'Tekil çatışma tasarımı', startingCounts: '4 öğe · 3 bağlantı · 2 grup', preview: 'Giriş → Baskı → Ödül',
    create: () => guidedTemplate(
      'Combat encounter',
      [
        ['entry', 'level', 'Karşılaşma girişi', '', 0, 100],
        ['enemy', 'entity', 'Düşman paketi', '', 250, 100],
        ['pattern', 'mechanic', 'Saldırı deseni', '', 500, 100],
        ['reward', 'entity', 'Ödül', '', 750, 100],
      ],
      [
        ['c1', 'entry', 'enemy', 'requires'],
        ['c2', 'enemy', 'pattern', 'affects'],
        ['c3', 'pattern', 'reward', 'produces'],
      ],
      [
        ['core', 'Karşılaşma çekirdeği', '#e86e9b', ['entry', 'enemy', 'pattern']],
        ['result', 'Ödül', '#e59647', ['reward']],
      ],
      ['Baskı eğrisini test et'],
      'Karşılaşmayı başlatır',
    ),
  },
  {
    id: 'economy-progression', name: 'Economy progression', description: 'Kazanım, harcama ve açılma hızını dengeleyin.',
    category: 'Ekonomi', useCase: 'İlerleme ekonomisi', startingCounts: '4 öğe · 3 bağlantı · 2 grup', preview: 'Kazan → Harca → Aç',
    create: () => guidedTemplate(
      'Economy progression',
      [
        ['source', 'system', 'Kaynak kazanımı', '', 0, 100],
        ['currency', 'system', 'Para birimi', '', 250, 100],
        ['sink', 'system', 'Harcama noktası', '', 500, 100],
        ['unlock', 'quest', 'Açılan içerik', '', 750, 100],
      ],
      [
        ['e1', 'source', 'currency', 'produces'],
        ['e2', 'currency', 'sink', 'requires'],
        ['e3', 'sink', 'unlock', 'produces'],
      ],
      [
        ['income', 'Kazanç', '#83a963', ['source', 'currency']],
        ['spend', 'Harcama', '#e59647', ['sink', 'unlock']],
      ],
      ['Harcama temposunu ölç'],
      'Kaynağı harcamaya taşır',
    ),
  },
  {
    id: 'branching-narrative', name: 'Branching narrative', description: 'Seçimler, sonuçlar ve geri dönüş koşulları.',
    category: 'Anlatı', useCase: 'Dallanan diyalog', startingCounts: '5 öğe · 5 bağlantı · 2 grup', preview: 'Seçim → Dal → Sonuç',
    create: () => guidedTemplate(
      'Branching narrative',
      [
        ['scene', 'narrative', 'Sahne girişi', '', 0, 100],
        ['choice', 'ui', 'Oyuncu seçimi', '', 250, 100],
        ['a', 'narrative', 'A dalı', '', 500, 30],
        ['b', 'narrative', 'B dalı', '', 500, 180],
        ['outcome', 'entity', 'Kalıcı sonuç', '', 750, 100],
      ],
      [
        ['n1', 'scene', 'choice', 'requires'],
        ['n2', 'choice', 'a', 'affects'],
        ['n3', 'choice', 'b', 'affects'],
        ['n4', 'a', 'outcome', 'produces'],
        ['n5', 'b', 'outcome', 'produces'],
      ],
      [
        ['choice', 'Seçim noktası', '#7058dd', ['scene', 'choice']],
        ['branches', 'Anlatı dalları', '#e86e9b', ['a', 'b', 'outcome']],
      ],
      ['Her dalın sonucunu belirle'],
      'Seçim ekranını açar',
    ),
  },
  {
    id: 'ui-flow', name: 'UI flow', description: 'Ekran geçişlerini, durumları ve geri bildirimleri haritalayın.',
    category: 'Arayüz', useCase: 'Oyuncu arayüz akışı', startingCounts: '4 öğe · 3 bağlantı · 2 grup', preview: 'Giriş → Ekran → İşlem',
    create: () => guidedTemplate(
      'UI flow',
      [
        ['entry', 'ui', 'Ana giriş', '', 0, 100],
        ['screen', 'ui', 'Ana ekran', '', 250, 100],
        ['action', 'ui', 'Oyuncu işlemi', '', 500, 100],
        ['feedback', 'ui', 'Sonuç geri bildirimi', '', 750, 100],
      ],
      [
        ['u1', 'entry', 'screen', 'requires'],
        ['u2', 'screen', 'action', 'affects'],
        ['u3', 'action', 'feedback', 'produces'],
      ],
      [
        ['navigation', 'Gezinme', '#62a0ef', ['entry', 'screen']],
        ['response', 'İşlem ve sonuç', '#19b8b2', ['action', 'feedback']],
      ],
      ['Hata durumunu ekle'],
      'Ana ekrana gider',
    ),
  },
  {
    id: 'roguelite-run-loop', name: 'Roguelite run loop', description: 'Run başlangıcı, seçim, güçlenme ve tekrar döngüsü.',
    category: 'Roguelite', useCase: 'Tek koşu döngüsü', startingCounts: '5 öğe · 5 bağlantı · 3 grup', preview: 'Seç → Savaş → Güçlen → Tekrarla',
    create: () => guidedTemplate(
      'Roguelite run loop',
      [
        ['start', 'level', 'Run başlangıcı', '', 0, 100],
        ['choice', 'ui', 'Oda seçimi', '', 220, 100],
        ['encounter', 'level', 'Karşılaşma', '', 440, 100],
        ['reward', 'entity', 'Run ödülü', '', 660, 100],
        ['upgrade', 'mechanic', 'Geçici güçlenme', '', 660, 300],
      ],
      [
        ['r1', 'start', 'choice', 'requires'],
        ['r2', 'choice', 'encounter', 'requires'],
        ['r3', 'encounter', 'reward', 'produces'],
        ['r4', 'reward', 'upgrade', 'affects'],
        ['r5', 'upgrade', 'choice', 'affects'],
      ],
      [
        ['start', 'Run başlangıcı', '#7058dd', ['start', 'choice']],
        ['core', 'Karşılaşma ve ödül', '#e86e9b', ['encounter', 'reward']],
        ['upgrade', 'Güçlenme', '#83a963', ['upgrade']],
      ],
      ['Ödül seçeneklerini dengele'],
      'Run akışını başlatır',
    ),
  },
];

export const findTemplate = (id: TemplateId) => templates.find((template) => template.id === id)!;
