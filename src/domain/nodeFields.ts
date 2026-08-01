import type { NodeKind } from './types';

export type PropertyField = { key: string; label: string; placeholder: string; multiline?: boolean };
export const TYPE_FIELDS: Record<NodeKind, PropertyField[]> = {
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
};
