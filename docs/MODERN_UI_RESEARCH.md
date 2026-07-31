# GDD Tool Modern UI Araştırması ve Karar Belgesi

Tarih: 31 Temmuz 2026
Kapsam: Windows masaüstü, local-first ve çevrimdışı GDD çalışma alanı. Bu belge tam bir yeniden tasarım değil; sonraki UI dilimlerini yönlendiren araştırma ve karar kaydıdır. Ürün içine AI veya ağ bağımlılığı önermez.

## 1. Yönetici özeti

GDD Tool'un ayırt edici arayüz modeli “sonsuz tuval + yapılandırılmış oyun tasarım nesnesi” olmalıdır. Tuval keşif ve ilişki kurma yüzeyi; sağ panel ise ayrıntılı yazma yüzeyidir. Kartların belgeye dönüşmesi yerine özet kalması, kullanıcıya aynı anda hem sistem haritasını hem de seçili öğenin ayrıntısını sunar.

Önerilen yön:

1. Üst çubuğu proje kimliği, kayıt durumu ve az sayıdaki global komutla sadeleştir.
2. Nesne oluşturma araçlarını dikey creation rail'e, seçime bağlı eylemleri kartın yanında açılan context toolbar'a taşı.
3. Renk, tipografi, boşluk, radius, elevation ve hareket değerlerini semantic token sistemine geçir.
4. Kartlarda tür, başlık, kısa özet ve durum dışında uzun metin gösterme; ayrıntıyı sağ drawer'da aç.
5. Klavye, görünür odak, kontrast, 32 px etkileşim hedefi ve reduced-motion'u tasarım sisteminin kabul kriteri yap.

## 2. Kaynaklardan doğrulanan desenler

Bu bölümde “Olgu” kaynağın açıkça söylediği şeyi, “GDD Tool çıkarımı” ise ürüne özel tasarım kararını belirtir.

### Fluent 2 ve Windows yaklaşımı

- **Olgu:** Fluent 2, hard-code değerler yerine renk, tipografi, boşluk ve elevation gibi kararların design token olarak tutulmasını; global tokenların ham değerleri, alias tokenların semantik anlamı taşımasını önerir. Token sistemi açık, koyu ve yüksek kontrast temalarını desteklemek üzere tasarlanmıştır. [Fluent 2 — Design tokens](https://fluent2.microsoft.design/design-tokens)
- **GDD Tool çıkarımı:** CSS değişkenleri iki katmana ayrılmalı: `--global-*` ham palet/ölçek ve `--color-surface-canvas`, `--color-border-card-selected`, `--space-panel-padding` gibi semantik aliaslar. Bileşen içinde doğrudan hex ve rastgele piksel kullanımı kademeli olarak kaldırılmalı.
- **Olgu:** Fluent yerleşim sistemi 4 px tabanlı spacing ramp kullanır; boşluk ve yakınlık, ilişkili içerikleri gruplamak ve görsel hiyerarşi kurmak için kullanılır. [Fluent 2 — Layout](https://fluent2.microsoft.design/layout)
- **GDD Tool çıkarımı:** 4/8/12/16/24/32 değerleri ana spacing ölçeği olmalı. Kart içi yakın alanlar 4–8, bölüm ayrımları 16, panel kenarları 20–24 px kullanmalı.
- **Olgu:** Fluent'in Windows type ramp'i Segoe UI Variable kullanır; gövde metni 14/20, caption 12/16, subtitle 20/28 ölçeklerindedir. Fluent ayrıca sentence case kullanılmasını ve standart metin için en az 4.5:1 kontrastı belirtir. [Fluent 2 — Typography](https://fluent2.microsoft.design/typography)
- **GDD Tool çıkarımı:** Windows'ta `Segoe UI Variable, Segoe UI, system-ui` stack'i; kart gövdesinde 12/16, ana arayüzde 14/20, drawer başlığında 20/28 kullanılmalı. Eyebrow metinlerde mevcut tüm-büyük-harf yaklaşımı azaltılıp sentence case'e geçilmeli.
- **Olgu:** Fluent toolbar, sık kullanılan ve mevcut göreve bağlı eylemleri sunar; komutlar mantıksal gruplara ayrılmalı, tek satırda kalmalı ve sığmayanlar etiketli overflow menüsüne taşınmalıdır. Destructive veya çalışma durumunu etkileyen eylemler diğerlerinden ayrılmalıdır. [Fluent 2 — Toolbar](https://fluent2.microsoft.design/components/web/react/core/toolbar/usage)
- **GDD Tool çıkarımı:** Yeni/Aç/Kaydet/Farklı Kaydet gibi dosya komutları “Dosya” menüsünde gruplanmalı; üst çubukta proje adı, dirty/kayıt durumu, Kaydet ve Kontrol kalmalı. Undo/redo ile görünüm komutları ayrı grup olmalı; dar pencerede overflow'a düşmeli, ikinci satıra sarılmamalı.
- **Olgu:** Fluent card tek bir kavram veya nesneye ait bilgi ve eylemleri taşır; içerik kısa, ilk bakışta gerekli ve eyleme dönük olmalıdır. Tek belirgin eylem varsa tüm kart yüzeyi eylem olabilir. [Fluent 2 — Card](https://fluent2.microsoft.design/components/web/react/core/card/usage)
- **GDD Tool çıkarımı:** GDD kartı tür + başlık + en fazla iki satır özet + durum işaretini göstermeli. Çift tıklama/tüm kart eylemi ayrıntıyı açmalı; ikincil komutlar karta sürekli doldurulmamalı.
- **Olgu:** Fluent drawer, ana içerikle ilgili ek bilgi ve basit eylemler için kenardan açılan ikincil yüzeydir. Inline drawer ana içerikle eşzamanlı çalışmaya, overlay drawer daha odaklı göreve uygundur; drawer başlık, body ve isteğe bağlı footer anatomisine sahiptir. Uzun içerik body içinde kaydırılmalıdır. [Fluent 2 — Drawer](https://fluent2.microsoft.design/components/web/react/core/drawer/usage)
- **GDD Tool çıkarımı:** NodeDetailPanel geniş ekranda isteğe bağlı non-modal inline moda, dar ekranda overlay moda geçmeli. Başlığı ve kapatma eylemi sticky; form gövdesi tek kaydırma alanı olmalı. Uzun ve sık düzenlenen içerik için full-page seçeneği ancak sonraki aşamada düşünülmeli.

### WCAG 2.2

- **Olgu:** WCAG 2.2 AA, pointer hedefi için en az 24×24 CSS px veya eşdeğer hedef aralığı ister. [W3C — Target Size (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum)
- **GDD Tool çıkarımı:** Yoğun masaüstü araçlarında dahi 32×32 px ürün tabanı kullanılmalı; birincil eylemler 36–40 px olmalı. Bağlantı handle'larının görsel ölçüsü küçük kalabilir ancak görünmez hit alanı en az 24 px olmalı.
- **Olgu:** Normal metin için 4.5:1, büyük metin için 3:1 kontrast gerekir; bilgi yalnız renkle verilmemelidir. [WCAG 2.2 — Contrast Minimum](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum) ve [Use of Color](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html)
- **GDD Tool çıkarımı:** Nesne türü ve validation severity yalnız renk değil metin/ikon/çizgi biçimiyle de gösterilmeli. Token çiftleri otomatik kontrast testine alınmalı.
- **Olgu:** Klavye odağı görünür olmalı, mantıklı sırada ilerlemeli ve uygulamanın açtığı yüzeyler tarafından tamamen örtülmemelidir. WCAG 2.2 ayrıca güçlü focus appearance için en az 2 px çevre alanına eşdeğer ve 3:1 değişim kontrastını tarif eder. [Focus Order](https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html), [Focus Not Obscured](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html), [Focus Appearance](https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance.html)
- **GDD Tool çıkarımı:** Bütün interaktif bileşenlerde 2–3 px yüksek kontrastlı `:focus-visible` halkası kullanılmalı. Drawer tam focus trap ve açan kontrole focus restore kazanmalı. Sabit header/paneller odaklanan tuval öğesini örtmemeli.
- **Olgu:** WCAG, sürükleme ile yapılan bir işlemin sürükleme gerektirmeyen tek-pointer alternatifi olmasını ister. [WCAG 2.2 — Dragging Movements](https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements.html)
- **GDD Tool çıkarımı:** Kart taşıma için ok tuşları korunmalı; sayfa/outline yeniden sıralama geldiğinde Move up/down menü komutları da sunulmalı.

### React Flow

- **Olgu:** React Flow; klavyeyle node/edge seçimi, oklarla node taşıma, otomatik pan, ARIA rolleri ve yerelleştirilebilir `ariaLabelConfig` sağlar. [React Flow — Accessibility](https://reactflow.dev/learn/advanced-use/accessibility)
- **GDD Tool çıkarımı:** Bu varsayılanlar kapatılmamalı; bütün screen-reader talimatları Türkçeleştirilmeli. Node'lara tür, başlık, durum ve ilişki sayısını içeren açıklayıcı `aria-label` eklenmeli.
- **Olgu:** `NodeToolbar`, seçili node yanında sabit görsel ölçüde toolbar gösterebilir; `Panel` viewport üstünde sabit içerik, MiniMap ise büyük akışlarda kuşbakışı gezinme sağlar. [React Flow — Components](https://reactflow.dev/api-reference/components) ve [Built-in components](https://reactflow.dev/learn/concepts/built-in-components)
- **GDD Tool çıkarımı:** Seçili kart için Detayı aç, Bağla, Çoğalt ve Sil komutları `NodeToolbar` ile gösterilmeli. Bağlantı türü ve filtre gibi viewport genel komutları `Panel` içinde kalmalı. Kalıcı buton yığınları kartın içine konmamalı.
- **Olgu:** React Flow varsayılan harita benzeri pan/zoom ile tasarım aracı benzeri pan/zoom yapılandırmalarını ayrı ayrı tarif eder. [React Flow — Panning and Zooming](https://reactflow.dev/learn/concepts/the-viewport)
- **GDD Tool çıkarımı:** İlk kullanımda mevcut map davranışı korunmalı; Preferences altında “Harita / Tasarım aracı” etkileşim profili daha sonra sunulmalı. Mod değişimi açıklanmalı ve varsayılan sessizce değiştirilmemeli.

### Benzer ürünlerden kanıtlanabilen desenler

- **Olgu:** Miro, global board menüsünü sol üstte; oluşturma araçlarını sol creation toolbar'da; seçime bağlı eylemleri seçili nesnenin context menüsünde sunar. Toolbar kişiselleştirilebilir ve reduce-motion/accessibility checker ayarları vardır. [Miro — Toolbars](https://help.miro.com/hc/en-us/articles/360017730553-Toolbars)
- **GDD Tool çıkarımı:** Global, creation ve selection komutları üç ayrı katman olmalı. GDD Tool'un üst header'ına nesne oluşturma butonları eklenmemeli; gelecekte creation rail kişiselleştirilebilir olabilir.
- **Olgu:** Miro frame'leri tuval içeriğini yapılandırmak, gezinmek ve sunmak için; template picker'ı hazır veya boş içerikle başlangıç için kullanır. [Miro — Frames](https://help.miro.com/hc/en-us/articles/360018261813-Frames) ve [Templates](https://help.miro.com/hc/en-us/articles/360017572134-Templates)
- **GDD Tool çıkarımı:** “Frame” doğrudan kopyalanmamalı; GDD bağlamında sistem, chapter veya feature alanı olarak semantik container eklenmeli. Şablonlar başlangıç ekranıyla sınırlı kalmayıp aktif sayfaya eklenebilir modüller haline gelmeli.
- **Olgu:** Notion'da database öğeleri ayrı birer sayfadır ve görünüm ayarına göre sağ side peek, center peek veya full page açılabilir; side peek açıkken soldaki görünüm etkileşimli kalır. [Notion — Views, filters, sorts & groups](https://www.notion.com/help/views-filters-and-sorts) ve [Intro to databases](https://www.notion.com/help/intro-to-databases)
- **GDD Tool çıkarımı:** Özet kart + ayrıntılı nesne drawer modeli doğru yöndedir. İleride kullanıcı drawer/full-page tercihini görünüm bazında saklayabilir.
- **Olgu:** Notion masaüstünde yaygın dosya/gezinme eylemleri için klavye kısayolları ve `Esc` ile bağlamsal yüzey kapatma davranışı sunar. [Notion — Keyboard shortcuts](https://www.notion.com/help/keyboard-shortcuts)
- **GDD Tool çıkarımı:** Kısayollar menülerde görünür olmalı; command palette keşfedilebilirlik için roadmap'e alınmalı, ancak internet veya AI gerektirmemeli.
- **Olgu:** Milanote kartları görsel, bağlantı ve açıklama bölümlerini ayrı ayrı gösterebilir/gizleyebilir; kartlar başka board'lara shortcut olabilir. [Milanote — Links](https://help.milanote.com/en/articles/1722065-links)
- **GDD Tool çıkarımı:** Kart görünürlüğü ileride “kompakt / açıklamalı” iki yoğunluk seçeneği kazanabilir. Başka sayfadaki GDD nesnesine referans veren portal kart, nesneyi kopyalamadan çoklu bağlam göstermek için değerlendirilebilir.

## 3. GDD Tool tasarım kararları

### 3.1 Header ve komut hiyerarşisi

Önerilen masaüstü anatomisi:

1. **App/header (48–56 px):** Menü, proje adı, dirty/kayıt durumu; sağda Kontrol ve birincil Kaydet.
2. **Page tabs (36–40 px):** Aktif sayfa, overflow ve yeni sayfa. Rename/delete sağ tık veya overflow menüsünde.
3. **Creation rail (40–48 px genişlik):** Seçim/el, GDD nesnesi ekle, ilişki, semantik container, şablon.
4. **Canvas context toolbar:** Yalnız seçim varken, seçime yakın ve zoom'dan bağımsız.
5. **Viewport navigation:** Sol altta zoom/fit/lock; sağ altta MiniMap. Birbirlerinin üstüne binmemeli.

Kaydet dışındaki dosya eylemleri ve nadir komutlar menü/overflow'a taşınmalıdır. Validation sayısı header'da badge olabilir; panel açma komutu metin + ikonla kalmalıdır.

### 3.2 Token başlangıç sözleşmesi

Bu değerler Fluent'in sistemini birebir kopyalamak değil, GDD Tool için önerilen alias sözleşmesidir:

```css
:root {
  --font-family-base: "Segoe UI Variable", "Segoe UI", system-ui, sans-serif;
  --font-size-caption: 12px;
  --font-size-body: 14px;
  --font-size-subtitle: 20px;
  --line-height-caption: 16px;
  --line-height-body: 20px;
  --space-1: 4px; --space-2: 8px; --space-3: 12px;
  --space-4: 16px; --space-6: 24px; --space-8: 32px;
  --radius-control: 6px; --radius-card: 8px; --radius-panel: 12px;
  --control-height-compact: 32px; --control-height-default: 36px;
}
```

Renkler semantic adlarla tanımlanmalı: canvas/surface/panel/elevated; text-primary/secondary/disabled; border-subtle/strong/focus; accent; status-danger/warning/success. Node tür renkleri içerik kategorisi, hata renkleri durum anlamı taşımalı ve karıştırılmamalıdır.

### 3.3 Kart anatomisi

- Üst satır: tür etiketi + durum ikonu/badge.
- Ana satır: iki satıra kadar başlık; taşarsa ellipsis değil mümkün olduğunca wrap.
- Gövde: en fazla iki satır kısa özet.
- Alt meta: en fazla iki etiket ve `+N`; ilişki sayısı isteğe bağlı.
- Seçim: yalnız renge dayanmayan 2 px ring ve hafif elevation.
- Hata: validation ikonu + kısa accessible label; detay validation panelinde.
- Kart genişliği varsayılan 200–240 px; yoğunluk tercihi ileriki fazda.

### 3.4 Context toolbar

Tek seçimde Detayı aç, Bağla, Çoğalt ve `…`; çoklu seçimde Hizala, Grupla/Container'a al ve `…`. Sil gibi destructive komutlar overflow sonunda, ayrı grup ve teyit/undo güvencesiyle yer almalıdır. Toolbar node ile birlikte hareket etmeli fakat zoom ile küçülmemelidir.

### 3.5 Paneller ve drawer

- Outline: desktop'ta inline/collapsible, dar pencerede overlay.
- Inspector: hızlı özellikler için inline; NodeDetail uzun yazım için sağ drawer.
- Validation: sağ drawer veya alt problems panel; bir issue seçildiğinde sayfayı değiştirip node'u görünür alana pan etmeli.
- Aynı anda birden fazla modal overlay açılmamalı.
- Drawer header sticky, body scrollable; kapatınca odağı açan karta geri vermeli.

### 3.6 Empty state

Boş sayfa ortasında tek ana mesaj kullanılmalı:

> Bu sayfa henüz boş
> Bir GDD öğesi ekleyin veya hazır bir akış yerleştirin.

Eylemler: `İlk öğeyi ekle` (primary), `Şablon seç` (secondary). Altında kısayol ipucu olabilir. Boş sayfada bütün node türlerini aynı anda kartlar halinde göstermek yerine creation rail ve şablon seçici kullanılmalıdır.

### 3.7 Erişilebilirlik kabul kriterleri

- Normal metin 4.5:1; büyük metin ve temel grafik sınırları en az 3:1.
- Bütün pointer hedefleri en az 32×32 px ürün standardı; zorunlu alt sınır 24×24 px.
- Bütün komutlar klavyeyle erişilebilir; odak sırası header → tabs → outline → canvas → inspector/drawer.
- Focus ring en az 2 px eşdeğer alan ve 3:1 durum farkı hedefler.
- Renk tek anlam taşıyıcısı değildir.
- React Flow ARIA metinleri Türkçeleştirilir; node ve edge'ler anlamlı label alır.
- Sürükleme işlemlerinin menü/klavye alternatifi vardır.
- `prefers-reduced-motion` ile dekoratif animasyonlar kapanır.
- %200 metin büyütmede ve dar pencere genişliğinde işlev kaybı olmaz; %400 zoom senaryosu test planına girer.

## 4. Aşamalı roadmap

### Faz 0 — Güvenlik ve temel sistem

- Semantic token katmanı ve kontrast matrisi.
- Header tek satır + File/overflow menüsü.
- React Flow ARIA metinlerinin Türkçeleştirilmesi.
- Drawer focus trap/focus restore.
- 32 px hedef ve klavye regression testleri.

### Faz 1 — Tuval iş akışı

- Dikey creation rail.
- React Flow `NodeToolbar` tabanlı context toolbar.
- Kompakt kart anatomisi, durum ve etiket özeti.
- Empty state ve aktif sayfaya şablon ekleme.
- Validation issue seçilince `fitView`/pan.

### Faz 2 — Bilgi mimarisi

- Outline collapse/search/filter.
- Drawer inline/overlay responsive geçişi.
- Kart yoğunluğu: compact/detailed.
- Semantik container/frame ve sayfalar arası portal referansı.
- Yerel command palette ve kısayol yardım yüzeyi.

### Faz 3 — Oynanabilir playground hazırlığı

- View/Edit/Play modlarının açık ayrımı.
- Test edilebilir değişkenler, koşullar ve akış göstergeleri.
- Çalışma anı validation ve simülasyon olay günlüğü.
- Büyük projeler için performans bütçesi, sanallaştırma ve e2e canvas testleri.

## 5. Bu turda özellikle yapılmayanlar

- Tam header/creation rail/context toolbar yeniden tasarımı uygulanmadı.
- Fluent React bileşen bağımlılığı eklenmedi.
- AI, bulut veya ağ özelliği eklenmedi.
- Rakip arayüzleri piksel düzeyinde kopyalanmadı; yalnız resmi kaynaklarda doğrulanabilen etkileşim desenleri karar girdisi olarak kullanıldı.
