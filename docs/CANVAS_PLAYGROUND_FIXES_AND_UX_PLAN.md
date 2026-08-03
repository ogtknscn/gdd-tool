# Canvas/Playground Düzeltmeleri ve UX Sadeleştirme Planı

Tarih: 3 Ağustos 2026
Kapsam: Sezai'nin kullanım sırasında fark ettiği üç somut sorun, artan özellik
sayısı yüzünden oluşan UI/UX karmaşasına yönelik bir sadeleştirme planı ve
ürünün mevcut sınırları içinde kalan ek özellik fikirleri. Bu belge Claude
(hi-games-viam tarafı) tarafından kod okunarak ve Fable modeliyle yapılan
araştırma birleştirilerek hazırlandı; uygulama bu belgeyi Codex'e bırakılmıştır,
Claude tarafında herhangi bir kod değişikliği yapılmamıştır.

Codex bu belgeyi okuyunca `AGENTS.md`'deki zorunlu router akışını uygulamalı
(Sol -> Terra/Luna). Her madde ayrı, küçük ve doğrulanabilir bir değişiklik
olarak ele alınmalı; kapsam dışına çıkılmamalı.

## 1. Grup çerçevesi başlığı kartların arkasında kayboluyor (kök neden bulundu)

**Belirti:** Bir grup oluşturulduktan sonra üye kartlar başlığın üzerine
denk gelirse başlık görünmez oluyor; başlığı görebilmek için kartların yerini
değiştirmek gerekiyor.

**Kök neden:** `src/components/Canvas.tsx:66` içinde grup çerçevesi node'una
`zIndex: 0`, üye kartlara ise `zIndex: 1` veriliyor. `src/components/GddGroupFrame.tsx`
içindeki başlık/toggle butonu çerçeve div'inin normal akışında, ayrılmış bir
"başlık şeridi" olmadan render ediliyor. Çerçeve CSS'i
(`src/styles.css:45` ve `:52`) yalnızca 22px üst padding veriyor; bu padding
`src/domain/groups.ts`'teki `GROUP_FRAME_PADDING = 32` değeriyle birebir
eşleşen, kartlardan garanti biçimde arındırılmış bir bölge değil. Sonuç:
üye kart sürüklenip çerçevenin sol üst köşesine (başlığın olduğu yere)
denk getirilirse, üstteki zIndex nedeniyle kart başlığın üzerini kapatıyor.

**Düzeltme yönü:** Yalnızca z-index'i ters çevirmek (çerçeveyi kartların
üstüne almak) çerçevenin dolgu rengini kartların üstüne bindirir; bunun yerine
geometriye dayalı bir çözüm tercih edilmeli: `groupFrameGeometry`
(`src/domain/groups.ts`) ve üye kart yerleşimi, başlık şeridini kart
alanından hariç tutacak şekilde ayarlanmalı (örn. sabit ~32px'lik bir başlık
bandı üye kartların asla giremeyeceği bir bölge olarak ayrılmalı), böylece
davranış sürüklemeden bağımsız her zaman tutarlı olur.

**İlgili dosyalar:** `src/components/Canvas.tsx:66`,
`src/components/GddGroupFrame.tsx`, `src/domain/groups.ts`,
`src/styles.css:45,52`.

## 2. Playground'daki sticky/text/comment tipleri aslında aynı şey (tasarım kusuru, kök neden bulundu)

**Belirti:** Playground'da eklenen "yazı" tipli kart blokları (Not/Metin/Yorum)
farklı görünse de işlevsel olarak birbirinden farksız; farklı tiplere gerek yok,
hepsi düz metin. Başlıkların (etiketlerin) değiştirilebilir olması isteniyor.

**Doğrulama:** `src/domain/types.ts:77` içinde `type` alanı
`z.enum(['sticky', 'text', 'comment', 'image'])` olarak sabit; ilk üç tip
`src/components/PlaygroundCard.tsx:18-26`'da tamamen aynı `CommitFieldInput`
bileşenini render ediyor, tek fark CSS sınıfı ve `src/domain/i18n.ts:137-140`
(TR) / `:434-437` (EN) içindeki sabit, kullanıcı tarafından değiştirilemeyen
etiket metni.

**Düzeltme yönü:** Üç tipi tek bir "not" tipinde birleştir; etiket/başlık
sabit bir enum yerine karta özel, kullanıcı tarafından düzenlenebilir bir
alan olsun (isteğe bağlı bir renk anahtarı da eklenebilir). Eski
sticky/text/comment değerlerini proje açılırken tek tipe göç ettir
(schemaVersion artırımıyla, `src/domain/project.ts`'teki migrasyon zincirine
uygun biçimde). Bu birleşme aynı zamanda tuval araç çubuğundaki üç ayrı
oluşturma butonunu ikiye indirir (bkz. bölüm 5, P4).

**İlgili dosyalar:** `src/domain/types.ts:77-86` (`PlaygroundItemSchema`),
`src/components/PlaygroundCard.tsx`, `src/stores/projectStore.ts:388-395`
(`addPlaygroundItem`), `src/domain/project.ts` (migrasyon), `src/components/Canvas.tsx`
(sticky/text/comment butonları), `src/domain/i18n.ts` (etiketler).

## 3. Playground görselleri kaydedilmiyor (kök neden HENÜZ doğrulanmadı, tekrar üretim gerekiyor)

Dürüst olmak gerekirse: kodu okuyarak net bir hata bulamadım. Aşağıdaki
noktaları inceledim ve şüpheli bir şey görmedim; bu, hatanın orada olmadığı
anlamına gelmez, sadece statik okumayla bulunamadığı anlamına gelir. Codex'in
önce sorunu gerçekten tekrar üretmesi gerekiyor.

**İncelenip şüpheli bulunmayan noktalar:**
- `src/domain/image.ts`: görsel `Image.decode()` ile okunup canvas üzerinden
  JPEG data URL'e (maks. 1000px kenar, kalite 0.82) düşürülüyor; mantık doğru
  görünüyor.
- `addPlaygroundImage` / `updatePlaygroundItem`
  (`src/stores/projectStore.ts:397-410`) diğer tüm mutasyonlarla aynı
  `mutate` sarmalayıcısından geçiyor; dirty/undo takibi tutarlı görünüyor.
- Rust tarafı (`src-tauri/src/lib.rs`, `save_project_file` ve
  `save_project_snapshot`) tüm snapshot'ı tipsiz `serde_json::Value` olarak
  işleyip olduğu gibi diske yazıyor; hiçbir yerde alan süzülmüyor/atılmıyor.
- `src-tauri/tauri.conf.json`'da `data:` URL'leri engelleyecek bir CSP
  tanımlı değil.

**Codex'in tekrar üretirken netleştirmesi gereken sorular (gerekirse
kullanıcıya sorulmalı):**
- Görsel; eklendiği anda mı, "Kaydet"ten hemen sonra mı, dosyayı kapatıp
  yeniden açtıktan sonra mı, yoksa yalnızca uygulama yeniden başlatılıp
  crash-recovery akışından geçtikten sonra mı kayboluyor?
- Sorun tüm görsellerde mi yoksa belirli bir formatta/boyutta (8MB sınırına
  yakın dosyalar, belirli bir en-boy oranı vb.) mi oluyor?
- Sorun olduğunda devtools konsolunda bir hata var mı (`image.decode()`
  bazı formatlarda reddedebilir)?
- Büyük data URL'ler için Tauri IPC argüman boyutu bir sınıra takılıyor
  olabilir mi; gerçek data URL boyutu loglanıp test edilmeli.
- 650ms gecikmeli arka plan kurtarma anlık görüntüsü
  (`saveRecoverySnapshot`, `src/App.tsx:32`) mi yoksa asıl "Kaydet" akışı
  (`save_project_file`) mi görseli kaybediyor, yoksa her ikisi de mi?

**İlgili dosyalar:** `src/domain/image.ts`, `src/domain/storage.ts`,
`src/stores/projectStore.ts:397-410`, `src/App.tsx:32`,
`src-tauri/src/lib.rs`.

## 4. Ek özellik fikirleri (Fable modeliyle araştırıldı)

Fable modeli, README'nin "Roadmap" bölümünde ve `MODERN_UI_RESEARCH.md`'de
zaten planlanmış olanları (modül şablonları, semantik container'lar,
sayfalar arası portal, gelişmiş arama/outline, View/Edit/Play modları,
simülasyon, git-dostu format) hariç tutarak Miro, FigJam, Notion, Milanote,
World Anvil, Celtx, Arcweave, articy:draft, Twine, Obsidian Canvas ve benzeri
araçlardan GDD Tool'un sınırlarına (çevrimdışı, tek dosya, Windows masaüstü,
AI/ağ bağımlılığı yok, genel amaçlı bir whiteboard klonu olmama) uyan,
henüz planlanmamış özellik fikirleri üretti. Hiçbir AI/LLM özelliği önerilmedi
(ürün için açıkça yasak).

1. **Geri bağlantılar paneli ("buraya kim bağlanıyor"):** Detay panelinde,
   bir karta gelen ilişkileri tipe göre gruplayıp göster (Requires eden,
   Affects eden). Veri zaten `relations`'ta var; bir kartın etki alanını
   görmenin en ucuz yolu. (Obsidian/Notion geri bağlantılarından esinlenildi.)
2. **Metin içinde @-bahsetme:** Açıklama alanlarında `@` yazınca kart seçici
   açılsın, canlı referans eklensin; üzerine gelince önizleme, tıklayınca
   git. İsteğe bağlı olarak bahsetmeden gerçek bir ilişkiye dönüştürme
   sunulabilir. (Notion mentions, Celtx.)
3. **Tüm nesnelerin tablo görünümü:** Tip, başlık, durum, etiket, ilişki
   sayısına göre sıralanabilir/filtrelenebilir bir tablo; satır içi durum
   düzenleme ve tuvaldeki konuma tıklayıp gitme. (Notion databases,
   articy:draft entity tables.)
4. **Nesne tipine özel alanlar:** Her stüdyonun GDD şablonu farklı; Mechanic,
   Entity vb. tiplere takım özel tipli alan (sayı, enum, checkbox, metin)
   ekleyebilsin, şema sürümlü JSON'da saklansın. (articy:draft custom
   templates.)
5. **Bağımlılık odak modu:** Bir kart seçilip bir tuşa basılınca, seçilen
   ilişki tiplerini takip ederek yalnızca N-derece komşuluğu parlak,
   gerisini soluk göster. Kalabalık bir sayfayı anlık etki analizine
   çevirir. (Obsidian graph filtreleri, articy reference views.)
6. **Sürükleyerek bağlı yeni kart oluşturma:** Bağlantı kolunu boş tuvale
   sürükleyince tip seçici ile yeni, zaten bağlı bir kart oluşsun. React
   Flow bunu `onConnectEnd` ile zaten destekliyor. (Whimsical/FigJam'deki
   en hızlı akış deseni.)
7. **İlişki notu:** Bir ilişkiye isteğe bağlı kısa serbest metin notu
   ("yalnızca tutorial sonrası", "yumuşak bağımlılık") eklenip yüksek
   zoom'da kenar üzerinde ve Inspector'da gösterilsin. (Arcweave, Miro
   connector labels.)
8. **Tasarım kapsama panosu:** Yerel bir rapor: duruma göre kart sayısı,
   ilişkisiz (öksüz) kartlar, boş zorunlu alanlar, en eski güncellenen
   kartlar. "Bu GDD ne kadar tamam" sorusunu okumadan cevaplar. (World
   Anvil completion tracker'larından kısmen esinlenildi, kısmen özgün.)
9. **Çerçevelerin sunum modu:** Grup/çerçeveleri bir sıraya dizip tam ekran
   adım adım gezerek tek makineden ekibe bir sistemi anlatma. Çevrimdışı,
   işbirliği gerektirmiyor. (Miro Frames sunum modu, FigJam sections.)
10. **Seçimi/çerçeveyi PNG/SVG olarak dışa aktar:** Tüm proje PDF'ine ek
    olarak tek bir sistem haritasını slayt ya da motor ekibiyle paylaşım
    için görsel olarak dışa aktar. (Miro/FigJam frame export.)
11. **Gömülü görsel yöneticisi:** Tüm base64 görselleri boyut ve kullanım
    sayısıyla listeleyen bir panel; aynı görsel iki yerde kullanılıyorsa
    tekilleştirme. `.gdd.json` şişmesini doğrudan azaltır. (Özgün fikir.)
12. **Outline sırasına göre Markdown dışa aktarma:** PDF ile aynı modelden
    üretilen, sayfa/grup başına başlık, kart başına bölüm içeren, wiki/kod
    incelemesi/arşivleme için okunabilir düz `.md` çıktısı. (Notion/Obsidian
    taşınabilirlik normları.)
13. **İki proje dosyası karşılaştırma:** İki `.gdd.json` dosyasını açıp
    kart bazında eklenen/silinen/değişen alan ve ilişki raporu. E-posta ile
    dosya paylaşan ekipler için bugün bile faydalı, roadmap'teki git-dostu
    formattan bağımsız. (articy:draft partition compare.)
14. **Yerel inceleme damgaları:** Bir incelemecinin masaüstü değerlendirmesi
    sırasında kartlara bıraktığı hafif onay/itiraz işaretleri, çözülebilir
    bir kontrol listesinde toplansın. Tek makinede, dosya paylaşımıyla
    asenkron çalışır. (FigJam stamps, Miro review workflows.)

Kaynaklar: [Machinations: 9 game design tools](https://machinations.io/articles/9-game-design-tools),
[Storyflow: best GDD and worldbuilding tools 2026](https://storyflow.so/blog/best-game-design-document-worldbuilding-tools-2026),
[Storyflow: best game design tools 2026](https://storyflow.so/blog/best-game-design-tools-2026),
[Arcweave: top 10 narrative design tools](https://blog.arcweave.com/top-10-tools-for-narrative-design),
[World Anvil vs Obsidian comparison](https://lorearchitect.com/world-anvil-vs-obsidian-a-world-builders-deathmatch/),
[articy:draft alternatives](https://alternativeto.net/software/articy-draft/about).

## 5. UI/UX sadeleştirme planı (Fable modeliyle araştırıldı)

Önce genel değerlendirme: `docs/MODERN_UI_RESEARCH.md`'deki yön kısmen hayata
geçmiş (creation rail var, header'da Dosya ve taşma menüsü var, playground
kartlarında NodeToolbar kullanılıyor, detay çekmecesi var). Asıl karmaşa, o
yönden önce eklenmiş veya onu atlayan özelliklerden geliyor; en çok da tuval
araç çubuğu ve tekrarlanan kontrol yerleşimlerinden. Öncelik sırasına göre:

**P1. Tuval araç çubuğunu dağıt (`Canvas.tsx:82`).** Tek, her zaman görünen
şerit şunları taşıyor: bağlantı tipi seçici, Grup Oluştur, Filtre (popover
ile), açıklamalı Readiness anahtarı, koşullu Bağlantıyı İptal Et butonu ve
playground açıkken 4 buton daha (Not/Metin/Yorum/Görsel). Bu, tek satırda
6-10 rakip kontrol demek; `MODERN_UI_RESEARCH.md` bölüm 3.1'in tam olarak
reddettiği "kalabalık üst çubuk" durumu.
- Not/Metin/Yorum/Görsel oluşturma butonlarını `CreationRail.tsx`'e,
  playground modu açıkken görünen ikinci bir rail grubuna taşı. Bölüm 2'deki
  birleştirmeden sonra bu zaten Not + Görsel, iki butona iner.
- Bağlantı tipi seçiciyi kalıcı çubuktan çıkar: yalnızca bağlantı kurulurken
  anlamlı, seçili kart bağlam araç çubuğunda ya da hızlı-ekle akışında
  gösterilmeli.
- Filtre ve Readiness'i sağ üstte küçük bir React Flow `Panel`'inde iki
  kompakt anahtara indir; readiness istatistik metnini araç çubuğundan
  çıkarıp ValidationPanel'e veya küçük bir rozete taşı.
- Grup Oluştur yalnızca çoklu seçimde anlamlı: çoklu-seçim bağlam araç
  çubuğuna taşı (araştırma 3.4 zaten "Grupla"yı orada tanımlıyor), kalıcı
  çubuktan kaldır.

**P2. GDD kartlarına, playground kartlarının zaten sahip olduğu bağlam araç
çubuğunu ver.** `PlaygroundCard.tsx` Sil için `NodeToolbar` kullanıyor;
`GddNodeCard`'da bu yok, bu yüzden seçim eylemleri üç ayrı yerde: Inspector'ın
Bağlan seçici, yalnızca klavyeden Sil (`Canvas.tsx:75`), yalnızca çift
tıklamayla Detayı Aç. Seçili GDD kartlarına Detayı Aç, Bağlan, Çoğalt ve
taşmada Sil içeren bir `NodeToolbar` ekle (araştırma 3.4). Bu, "planlanan
yön ama henüz hayata geçmemiş" en büyük boşluk ve P3'ün Inspector'ı
küçültmesini mümkün kılıyor.

**P3. Inspector'ı küçült veya kaldır (`Inspector.tsx`).** Şu anda
NodeDetailPanel ile aynı alanları tekrarlıyor: başlık, özet, özel etiketli
ilişkiler ve silme, grup üyeliği. Aynı alanlar için iki düzenleme yüzeyi
"hangisini kullanmalıyım" sorusu yaratıyor. Araştırma 3.5, Inspector'ı yalnızca
hızlı özellikler için tanımlıyor. Kind, başlık, durum, etiket, grup üyeliği ve
"Tam detayı aç" butonuna indir; özet düzenlemeyi ve tüm ilişki bloğunu kaldır
(ilişki düzenleme zaten çekmecede var, bağlama P2'deki bağlam araç çubuğuna
taşınıyor). Sonrasında panel fazla inceyse tamamen çekmeceye katılıp panel
yuvası boşaltılabilir.

**P4. Sticky/text/comment'i tek "not" tipinde birleştir (doğrulanan kusur
2).** `PlaygroundCard.tsx:26`'da görsel olmayan üç tip birebir aynı render
ediliyor; yalnızca etiket ve CSS sınıfı farklı. Tek bir `note` tipine indir,
kartın bağlam araç çubuğunda isteğe bağlı bir renk anahtarı sun (eski tipleri
proje açılışında göç ettir). Bu, iki oluşturma butonunu kaldırıp P1'e yardımcı
olur ve kullanıcıya sahte bir taksonomi kararı dayatmayı bitirir. Görsel
kaydetme hatası (kusur 3) aynı mağaza yollarına
(`addPlaygroundImage`, `imageData` kalıcılığı) dokunduğu için aynı dilimde
ele alınmalı.

**P5. Çerçeveye ayrılmış bir başlık bandı ayır (doğrulanan kusur 1).**
`Canvas.tsx:66` çerçeveleri `zIndex: 0`, kartları `zIndex: 1` ile, ayrılmış
bir başlık alanı olmadan sabitliyor. `GddGroupFrame`'e kart z-index'inin
üzerinde render edilen sabit bir başlık şeridi (yaklaşık 32px) ver, ya da
`groupFrameGeometry`'yi üye sınırları başlığın altından başlayacak şekilde
kaydır. Başlık bandı aynı zamanda doğal bir sürükleme tutamacı olur ve
odak/daraltma anahtarlarının evi haline gelir; çerçeve gövdesini de
sadeleştirir.

**P6. Header taşma menüsünü inceltirin (`AppHeader.tsx`).** `•••` menüsü
panel anahtarlarını (Outline, Inspector, Playground, Markdown önizleme), bir
görünüm anahtarını (Readiness), Şablonları, iki ayarı (yoğunluk, dil) ve
Kısayolları karıştırıyor. Nadiren değişen ayarlar (dil, yoğunluk) bir
Tercihler diyaloğuna taşınmalı ya da en azından ayrı gruplanmalı; panel
anahtarları zaten creation rail'de tekrarlanıyor (O ve I butonları), bu
yüzden iki evden birini kaldır, tercihen rail'i tut (araştırma 3.1) ve
menüden çıkar.

**P7. Küçük tutarlılık geçişleri.**
- `CreationRail.tsx` harf glifleri (M, V, B, AN, SI) artı bir emoji (💡) artı
  bir kutu glifi (▦) kullanıyor: tutarlı bir ikon setine veya en azından
  tutarlı iki harfli rozetlere geçir; karışık sistem karmaşa olarak okunuyor.
- `Outline.tsx` her tip bölümü için ayrı bir "+" ekleme butonu render ediyor,
  rail ile rekabet eden üçüncü bir oluşturma yüzeyi; bunları kaldırıp
  oluşturmanın tek evi olarak rail'i bırak.
- `PageTabs.tsx`'te sayfa adı değiştirme yalnızca çift tıklamayla oluyor;
  sağ tık ya da taşma menüsüne de ekle (araştırma 3.1 madde 2, aynı zamanda
  WCAG sürükleme-alternatifi maddesi).

**Önerilen sıra:** Önce P4 + kusur 3 düzeltmesi, sonra P5 (hataya bitişik,
küçük), ardından P2, P1, P3 tek bağlı bir dilim olarak, en son P6/P7 cila
olarak.

## Kapsam notu

Bu belge Sezai'nin doğrudan bildirdiği üç sorunu (bölüm 1-3) ve isteği üzerine
Fable modeliyle yapılan araştırmayı (bölüm 4-5) birleştirir. Hiçbir kod
değişikliği bu oturumda yapılmadı; belgeyi okuyup uygulama adımı Codex'e
bırakılmıştır. Bölüm 1 ve 2'nin kök nedeni koda bakılarak doğrulandı; bölüm
3 için kök neden doğrulanmadı, önce tekrar üretim gerekiyor.
