# GDD Tool

Ekiplerin kendi bilgisayarlarında kullanabileceği yenilikçi bir Game Design
Document aracı.

> Ürün şimdilik AI kullanmaz. Bu repodaki Sol → Terra/Luna sistemi yalnızca
> GDD Tool'u geliştirirken Codex görevlerini yönlendirmek içindir.

## Geliştirme router'ı

Bu klasörü Codex'te proje olarak açıp normal şekilde isteğinizi yazın:

```text
GDD araçları için internetten güncel rakip araştırması yap.
```

Repo talimatları şu akışı uygular:

1. **Sol** ham isteği yürütülebilir bir çalışma promptuna dönüştürür.
2. Ana Codex oturumu kapsam, risk ve belirsizliğe bakarak yürütücüyü seçer.
3. **Terra** araştırma, mimari, çok dosyalı geliştirme ve güçlü muhakeme
   gerektiren işleri yürütür.
4. **Luna** net, tekrarlanabilir ve düşük riskli işleri yürütür.
5. Ana oturum sonucu kontrol eder ve size tek bir tamamlanmış çıktı sunar.

API anahtarı, OpenAI SDK'sı veya ürün içinde model çağrısı bulunmaz. Agentlar,
ekip arkadaşının Codex'te açık olan kendi ChatGPT oturumunu kullanır.

Ayrıntılar için [geliştirme router'ı](docs/DEVELOPMENT_ROUTER.md) belgesine
bakın.

Güncel arayüz yenileme kararları ve aşamalı yol haritası için
[Modern UI araştırması](docs/MODERN_UI_RESEARCH.md) belgesine bakın.

## Masaüstü MVP

Uygulama Windows masaüstü hedefiyle Tauri 2, React, TypeScript ve Vite üzerinde
kuruludur. Çalışan sürüm şunları kapsar:

- Yakınlaştırılabilir tuval, altı semantik GDD nesnesi ve tipli ilişkiler
- Inspector, outline, şablonlar ve undo/redo
- Tek proje içinde eklenebilen, yeniden adlandırılabilen ve silinebilen sayfalar
- `.gdd.json` dosyaları için Yeni, Aç, Kaydet ve Farklı Kaydet akışları
- V1 proje dosyalarını V2 biçimine kayıpsız yükseltme
- Bozuk referansları, yinelenen bağlantıları ve `requires` döngülerini gösteren
  anlık proje kontrolü
- Koyu temalı tuval kontrolleri, minimap ve bağlantı etiketleri
- Tutarlı renk tokenları, modern masaüstü başlığı ve hızlı oluşturma rayı
- `Ctrl+K` komut paleti, klavye kısayolları ve erişilebilir panel kontrolleri
- Seçili kartta bağlama, çoğaltma ve silme için bağlamsal araç çubuğu
- Yakınlaştırma seviyesine göre sadeleşen veya detaylanan semantik kartlar
- Kart çift tıklamayla açılan Notion-benzeri GDD detay paneli
- Durum, etiket, tasarım niyeti, oyuncu deneyimi, detaylı tanım, test notları
  ve öğe türüne özgü alanlar
- Kullanıcı dosyasından ayrı çalışan yerel kurtarma kaydı

```powershell
npm install
npm test
npm run tauri dev
```

Windows paketlerini yeniden üretmek için `npm run tauri build` kullanın. Hazır
kurulum ve doğrudan çalışan EXE dosyaları `artifacts/` klasöründedir.

Güncel proje şeması V3'tür; V1 ve V2 dosyalar açılırken veri kaybetmeden
yükseltilir. Kayıt atomik JSON snapshot'ıdır: sayfalar, nesneler, canvas yerleşimleri ve
ilişkiler veri modelinde ayrı tutulur. Tarayıcıdaki localStorage yalnızca
geliştirme/test fallback'idir; masaüstü ürün kaydı Tauri dosya komutlarıyla
yapılır. İleride aynı domain modeli korunarak proje klasöründe nesne bazlı
dosyalara ve Git dostu diff'lere geçilebilir.
