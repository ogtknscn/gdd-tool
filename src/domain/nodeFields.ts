import type { Language } from './i18n';
import type { NodeKind } from './types';

export type PropertyField = { key: string; label: string; placeholder: string; multiline?: boolean };

const TYPE_FIELDS_BY_LANGUAGE: Record<Language, Record<NodeKind, PropertyField[]>> = {
  tr: {
    mechanic: [
      { key: 'rules', label: 'Kurallar', placeholder: 'Mekaniğin sınırları ve kuralları…', multiline: true },
      { key: 'inputs', label: 'Oyuncu girdileri', placeholder: 'Tuşlar, hareketler veya kararlar…' },
      { key: 'feedback', label: 'Geri bildirim', placeholder: 'Görsel, işitsel ve dokunsal karşılıklar…', multiline: true },
    ],
    entity: [
      { key: 'role', label: 'Oyun içindeki rol', placeholder: 'Bu varlık neden var?' },
      { key: 'attributes', label: 'Nitelikler', placeholder: 'Can, hız, kaynaklar…', multiline: true },
      { key: 'behaviour', label: 'Davranış', placeholder: 'Durumlar ve tepkiler…', multiline: true },
    ],
    level: [
      { key: 'objective', label: 'Bölüm hedefi', placeholder: 'Oyuncunun ulaşması gereken sonuç…' },
      { key: 'flow', label: 'Akış ve tempo', placeholder: 'Karşılaşmalar, dinlenme ve yükseliş…', multiline: true },
      { key: 'constraints', label: 'Kısıtlar', placeholder: 'Alan, süre veya kaynak sınırları…', multiline: true },
    ],
    quest: [
      { key: 'trigger', label: 'Tetikleyici', placeholder: 'Görevi ne başlatır?' },
      { key: 'objectives', label: 'Hedefler', placeholder: 'Sıralı görev adımları…', multiline: true },
      { key: 'rewards', label: 'Ödüller', placeholder: 'Oyuncunun kazanımları…', multiline: true },
    ],
    ui: [
      { key: 'purpose', label: 'Arayüz amacı', placeholder: 'Hangi kararı veya eylemi destekler?' },
      { key: 'states', label: 'Durumlar', placeholder: 'Boş, yükleniyor, hata, başarı…', multiline: true },
      { key: 'accessibility', label: 'Erişilebilirlik', placeholder: 'Klavye, kontrast, ölçekleme…', multiline: true },
    ],
    asset: [
      { key: 'assetType', label: 'Asset türü', placeholder: 'Model, ses, animasyon, VFX…' },
      { key: 'requirements', label: 'Üretim gereksinimleri', placeholder: 'Boyut, format, teknik bütçe…', multiline: true },
      { key: 'dependencies', label: 'Bağımlılıklar', placeholder: 'Bağlı kaynaklar ve teslimatlar…', multiline: true },
    ],
    narrative: [
      { key: 'beatType', label: 'Beat türü', placeholder: 'Sahne, diyalog, cutscene, dallanma…' },
      { key: 'charactersInvolved', label: 'Dahil olan karakterler', placeholder: 'Bu anda kim var, kim konuşuyor…' },
      { key: 'emotionalTarget', label: 'Duygusal hedef', placeholder: 'Oyuncu bu anda ne hissetmeli?', multiline: true },
    ],
    system: [
      { key: 'resourcesTouched', label: 'Etkilenen kaynaklar', placeholder: 'Hangi para birimi, kaynak veya istatistik değişiyor?' },
      { key: 'sourceOrSink', label: 'Kaynak mı, gider mi?', placeholder: 'Üretiyor mu, tüketiyor mu, dönüştürüyor mu?' },
      { key: 'tuningValues', label: 'Denge değerleri', placeholder: 'Oranlar, eğriler, sınırlar…', multiline: true },
    ],
    goal: [
      { key: 'targetValue', label: 'Hedef değer', placeholder: 'Ölçülebilir hedef (ör. D7 retention %25)' },
      { key: 'measurementMethod', label: 'Ölçüm yöntemi', placeholder: 'Bu nasıl ölçülecek?' },
      { key: 'currentStatus', label: 'Güncel durum', placeholder: 'Şu anki değer veya gözlem…', multiline: true },
    ],
    risk: [
      { key: 'severity', label: 'Ciddiyet', placeholder: 'Düşük, orta, yüksek…' },
      { key: 'owner', label: 'Sorumlu', placeholder: 'Bunu kim çözecek veya takip edecek?' },
      { key: 'resolutionCriteria', label: 'Çözülme kriteri', placeholder: 'Bu ne zaman "çözüldü" sayılır?', multiline: true },
    ],
  },
  en: {
    mechanic: [
      { key: 'rules', label: 'Rules', placeholder: "The mechanic's limits and rules…", multiline: true },
      { key: 'inputs', label: 'Player inputs', placeholder: 'Buttons, movements, or decisions…' },
      { key: 'feedback', label: 'Feedback', placeholder: 'Visual, audio, and haptic responses…', multiline: true },
    ],
    entity: [
      { key: 'role', label: 'Role in the game', placeholder: 'Why does this entity exist?' },
      { key: 'attributes', label: 'Attributes', placeholder: 'Health, speed, resources…', multiline: true },
      { key: 'behaviour', label: 'Behaviour', placeholder: 'States and reactions…', multiline: true },
    ],
    level: [
      { key: 'objective', label: 'Level objective', placeholder: 'The outcome the player needs to reach…' },
      { key: 'flow', label: 'Flow and pacing', placeholder: 'Encounters, rest, and escalation…', multiline: true },
      { key: 'constraints', label: 'Constraints', placeholder: 'Space, time, or resource limits…', multiline: true },
    ],
    quest: [
      { key: 'trigger', label: 'Trigger', placeholder: 'What starts the quest?' },
      { key: 'objectives', label: 'Objectives', placeholder: 'Ordered quest steps…', multiline: true },
      { key: 'rewards', label: 'Rewards', placeholder: "The player's gains…", multiline: true },
    ],
    ui: [
      { key: 'purpose', label: 'UI purpose', placeholder: 'Which decision or action does it support?' },
      { key: 'states', label: 'States', placeholder: 'Empty, loading, error, success…', multiline: true },
      { key: 'accessibility', label: 'Accessibility', placeholder: 'Keyboard, contrast, scaling…', multiline: true },
    ],
    asset: [
      { key: 'assetType', label: 'Asset type', placeholder: 'Model, audio, animation, VFX…' },
      { key: 'requirements', label: 'Production requirements', placeholder: 'Size, format, technical budget…', multiline: true },
      { key: 'dependencies', label: 'Dependencies', placeholder: 'Related assets and deliverables…', multiline: true },
    ],
    narrative: [
      { key: 'beatType', label: 'Beat type', placeholder: 'Scene, dialogue, cutscene, branch…' },
      { key: 'charactersInvolved', label: 'Characters involved', placeholder: "Who's present, who's speaking…" },
      { key: 'emotionalTarget', label: 'Emotional target', placeholder: 'What should the player feel right now?', multiline: true },
    ],
    system: [
      { key: 'resourcesTouched', label: 'Resources touched', placeholder: 'Which currency, resource, or stat changes?' },
      { key: 'sourceOrSink', label: 'Source or sink?', placeholder: 'Does it produce, consume, or convert?' },
      { key: 'tuningValues', label: 'Tuning values', placeholder: 'Rates, curves, limits…', multiline: true },
    ],
    goal: [
      { key: 'targetValue', label: 'Target value', placeholder: 'A measurable goal (e.g. D7 retention 25%)' },
      { key: 'measurementMethod', label: 'Measurement method', placeholder: 'How will this be measured?' },
      { key: 'currentStatus', label: 'Current status', placeholder: 'Current value or observation…', multiline: true },
    ],
    risk: [
      { key: 'severity', label: 'Severity', placeholder: 'Low, medium, high…' },
      { key: 'owner', label: 'Owner', placeholder: 'Who will resolve or track this?' },
      { key: 'resolutionCriteria', label: 'Resolution criteria', placeholder: 'When does this count as "resolved"?', multiline: true },
    ],
  },
};

export const typeFields = (kind: NodeKind, language: Language): PropertyField[] => TYPE_FIELDS_BY_LANGUAGE[language][kind];
