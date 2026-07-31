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
};
