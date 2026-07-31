# GDD Tool

[![Latest release](https://img.shields.io/github/v/release/ogtknscn/gdd-tool?label=s%C3%BCr%C3%BCm)](https://github.com/ogtknscn/gdd-tool/releases/latest)
[![Windows release](https://github.com/ogtknscn/gdd-tool/actions/workflows/release.yml/badge.svg)](https://github.com/ogtknscn/gdd-tool/actions/workflows/release.yml)

GDD Tool, oyun tasarım ekiplerinin fikirlerini uzun ve doğrusal belgeler yerine
birbirine bağlı, yapılandırılmış GDD nesneleri olarak düzenleyebilmesi için
geliştirilen yerel öncelikli bir Windows masaüstü uygulamasıdır.

> [!IMPORTANT]
> GDD Tool erken geliştirme aşamasındadır. Güncel sürüm; proje oluşturma,
> görsel tuval, ayrıntılı GDD kartları, ilişkiler, doğrulama ve yerel dosya
> kaydı için çalışan bir temel sunar. Gelecek vizyonundaki oynanabilir
> playground ve gelişmiş simülasyon özellikleri henüz ürünün parçası değildir.

Uygulama çevrimdışı çalışır. Ürün içinde AI, OpenAI API, model çağrısı, bulut
hesabı veya API anahtarı bulunmaz.

## Hızlı bağlantılar

- [En güncel sürümü indir](https://github.com/ogtknscn/gdd-tool/releases/latest)
- [Kurulum ve ilk kullanım](#indirme-ve-kurulum)
- [Klavye kısayolları](#klavye-kısayolları)
- [Geliştirici kurulumu](#geliştirme)
- [Bilinen sınırlar](#bilinen-sınırlar)

## Neden GDD Tool?

Klasik GDD belgeleri proje büyüdükçe uzun, doğrusal ve güncelliğini koruması
zor yapılara dönüşebilir. Bir mekaniğin görevleri, arayüzü, seviyeleri ve asset
gereksinimlerini nasıl etkilediğini tek bakışta görmek güçleşir.

GDD Tool iki çalışma biçimini bir araya getirir:

- Sistemleri ve aralarındaki ilişkileri görmek için yakınlaştırılabilir görsel
  tuval
- Her oyun tasarımı öğesini ayrıntılı tanımlamak için yapılandırılmış detay
  paneli

Böylece ekip, oyunun genel sistem haritasını ve seçilen öğenin tasarım
ayrıntılarını aynı proje içinde tutabilir. Amaç genel amaçlı bir beyaz tahta
kopyası olmak değil; serbest düşünme alanını GDD'ye özgü veri ve ilişkilerle
birleştirmektir.

## Mevcut özellikler

### Görsel GDD çalışma alanı

- Yakınlaştırma, uzaklaştırma, ekrana sığdırma ve minimap destekli tuval
- Sürüklenerek konumlandırılabilen GDD kartları
- Yakınlaştırma düzeyine göre değişebilen kompakt, standart ve detaylı kart
  görünümleri
- Birden fazla sayfa; sayfa ekleme, yeniden adlandırma ve silme
- Outline, Inspector ve Notion benzeri ayrıntı paneli
- `Ctrl+K` ile açılan yerel komut paleti
- Geri alma ve yineleme geçmişi
- Uygulama tasarımıyla uyumlu onay, hata ve bildirim pencereleri

### GDD nesneleri

Altı yapılandırılmış nesne türü bulunur:

| Nesne | Örnek kullanım |
| --- | --- |
| Mekanik | Kurallar, oyuncu girdileri ve geri bildirimler |
| Varlık | Karakterler, düşmanlar, kaynaklar ve davranışlar |
| Bölüm | Hedef, akış, tempo ve kısıtlar |
| Görev | Tetikleyici, hedef adımları ve ödüller |
| Arayüz | UI amacı, durumlar ve erişilebilirlik notları |
| Asset | Kaynak türü, üretim gereksinimleri ve bağımlılıklar |

Her kartta başlık, kısa özet, durum ve etiketler tutulabilir. Ayrıntı panelinde
ayrıca tasarım niyeti, hedeflenen oyuncu deneyimi, detaylı tanım, test notları
ve nesne türüne özgü alanlar düzenlenebilir.

Kart durumları **Taslak**, **Üzerinde çalışılıyor**, **Doğrulandı** ve
**Arşivlendi** olarak izlenir.

### İlişkiler

Kartlar arasında dört tür ilişki kurulabilir:

- Gerektirir
- Etkiler
- Üretir
- Test edilir

İlişkiler tuvalden seçilebilir; tuval, Inspector veya kart ayrıntısından
silinebilir. Seçili bir bağlantı `Delete` ya da `Backspace` ile de kaldırılabilir.
Silme işlemi önce onay ister ve geri alınabilir.

### Başlangıç şablonları

Yeni proje oluştururken üç başlangıç noktası kullanılabilir:

- **Boş çalışma alanı:** Serbest başlangıç
- **Core loop:** Mekanik, ödül ve arayüz bağlantılarıyla temel oyuncu döngüsü
- **Quest flow:** Görev adımları, arayüz ve ödül akışı

Şablonlar şu anda yeni proje başlangıç noktalarıdır; açık sayfaya eklenen modül
sistemi değildir.

### Proje kontrolü

Yerleşik **Kontrol** aracı şu tür veri sorunlarını tespit eder:

- Geçersiz aktif sayfa ve sayfa referansları
- Yinelenen nesne kimlikleri veya bağlantılar
- Sahipsiz, görünmeyen ya da sayfası uyuşmayan yerleşimler
- Kaynak veya hedefi bulunamayan bağlantılar
- Bir nesnenin kendisine bağlanması
- Sayfalar arasında geçersiz bağlantılar
- `requires` ilişkilerindeki döngüler

Bir kontrol sonucuna tıklandığında uygulama mümkünse ilgili sayfaya ve karta
yönelir.

## İndirme ve kurulum

Desteklenen hazır dağıtım hedefi **Windows x64**'tür. En güncel sürümü
[GitHub Releases](https://github.com/ogtknscn/gdd-tool/releases/latest)
sayfasındaki **Assets** bölümünden indirin.

| Dosya | Kullanım |
| --- | --- |
| `GDD-Tool-<sürüm>-x64-setup.exe` | Normal Windows kurulumu; çoğu kullanıcı için önerilir. |
| `GDD-Tool-portable.exe` | Kurulum gerektirmeden doğrudan çalışır. |

### Kurulum sürümü

1. En güncel sürüm sayfasını açın.
2. `GDD-Tool-<sürüm>-x64-setup.exe` dosyasını indirin.
3. Kurulum dosyasını çalıştırın.
4. Kurulumu tamamlayıp GDD Tool'u Başlat menüsünden açın.

### Portable sürüm

1. `GDD-Tool-portable.exe` dosyasını indirin.
2. Yazma izniniz olan bir klasöre taşıyın.
3. Dosyayı doğrudan çalıştırın.

Portable sürüm geleneksel bir Windows kurulumu yapmaz. Projeler uygulamadan
bağımsız `.gdd.json` dosyalarına kaydedilir; kurtarma verileri ise yine Windows
uygulama veri dizininde tutulabilir.

### Windows SmartScreen uyarısı

Mevcut paketler ticari bir kod imzalama sertifikasıyla imzalanmadığı için
Windows SmartScreen ilk çalıştırmada uygulamayı tanınmayan bir yayıncı olarak
gösterebilir. Bu uyarı Windows'un yayıncı imzasını doğrulayamadığını veya
dosyanın henüz yeterli itibara sahip olmadığını belirtir.

Dosyayı yalnızca bu deponun resmi GitHub Releases sayfasından indirdiğinizden
emin olun. Kaynağa güveniyorsanız **Daha fazla bilgi** bölümünde dosya adını
kontrol ederek devam edebilirsiniz. Güvenmediğiniz bir kaynaktan alınan
kopyaları çalıştırmayın.

## İlk kullanım

1. Uygulamayı açın.
2. **Boş çalışma alanı**, **Core loop** veya **Quest flow** şablonunu seçin.
3. Sol oluşturma çubuğundan bir GDD nesnesi ekleyin.
4. Kartı tuvalde istediğiniz konuma sürükleyin.
5. Kartı seçerek hızlı işlemleri, çift tıklayarak ayrıntı panelini açın.
6. Durum, etiket, tasarım niyeti, oyuncu deneyimi ve tür bazlı alanları
   doldurun.
7. Bağlantı türünü seçin ve kartları birbirine bağlayın.
8. Gerekirse `+` ile yeni sayfa oluşturun; sayfa adına çift tıklayarak yeniden
   adlandırın.
9. Üst çubuktaki **Kontrol** ile proje sorunlarını inceleyin.
10. **Kaydet** veya **Farklı kaydet** ile projeyi `.gdd.json` dosyasına yazın.

Kaydedilmemiş değişikliklerle yeni proje oluştururken veya başka bir dosya
açarken uygulama **Kaydet**, **Kaydetmeden devam** ve **İptal** seçeneklerini
sunar.

## Proje dosyaları ve veri güvenliği

### `.gdd.json` biçimi

GDD Tool projeleri okunabilir JSON snapshot'ları olarak saklanır. Güncel şema
sürümü V3'tür. Ana veri modeli şu bölümleri ayrı tutar:

| Alan | İçerik |
| --- | --- |
| `pages` | Proje sayfaları |
| `objects` | Yapılandırılmış GDD nesneleri |
| `placements` | Nesnelerin sayfa ve tuval koordinatları |
| `relations` | Nesneler arasındaki tipli bağlantılar |
| `activePageId` | Son aktif sayfa |
| `schemaVersion` | Dosya biçimi sürümü |

İçerik ile tuval konumu ayrı tutulduğu için kartın tasarım bilgileri ve görsel
yerleşimi veri modelinde birbirinden bağımsızdır.

### Atomik kayıt

Masaüstü uygulaması projeyi hedef dosyanın üzerine parça parça yazmaz. Önce aynı
konumda geçici bir JSON dosyası oluşturur, sonra bu dosyayı Windows'un
replace/write-through davranışıyla hedef dosyanın yerine geçirir. Bu yöntem
kayıt sırasında yarım yazılmış dosya riskini azaltır; yine de önemli projeleri
ayrıca yedeklemek önerilir.

### Yerel kurtarma kaydı

Uygulama, kullanıcının açıkça kaydettiği proje dosyasından ayrı bir kurtarma
snapshot'ı tutar. Proje değiştikten kısa süre sonra bu veri Windows uygulama
veri dizinindeki `autosave.gdd.json` dosyasına yazılır.

Uygulama yeniden açıldığında mevcut kurtarma snapshot'ı yüklenir ve
kaydedilmemiş değişiklik olarak işaretlenir. Bu kayıt normal **Kaydet** işleminin
ve kullanıcının seçtiği `.gdd.json` dosyasının yerine geçmez.

Tarayıcı tabanlı geliştirme ortamında `localStorage` yalnızca geliştirme ve test
fallback'i olarak kullanılır. Paketlenmiş masaüstü uygulaması dosya işlemlerini
Tauri/Rust komutlarıyla gerçekleştirir.

### Eski proje dosyaları

V1 ve V2 proje dosyaları açılırken bellekte V3 biçimine yükseltilir:

- V1 içeriği bir **Genel Bakış** sayfasına taşınır.
- V2 nesnelerine V3'teki durum, etiket ve ayrıntı alanları için güvenli
  varsayılanlar eklenir.
- Mevcut nesneler, yerleşimler, ilişkiler ve temel özellikler korunur.

Yükseltilmiş proje yeniden kaydedildiğinde V3 olarak yazılır. Eski ve önemli bir
projeyi ilk kez açmadan önce dosyanın kopyasını almak iyi bir uygulamadır.

### Gizlilik sınırı

- Proje içeriği yerel dosyalarda tutulur.
- Ürün içinde AI veya uzak model çağrısı yoktur.
- Bulut hesabı veya zorunlu oturum açma yoktur.
- Otomatik bulut yedekleme ya da gerçek zamanlı ekip senkronizasyonu yoktur.
- Proje dosyaları şifrelenmez; hassas içeriği normal yerel dosya güvenliği
  kurallarıyla koruyun.

Bir `.gdd.json` dosyasını ekip arkadaşınızla paylaşmanız, proje içeriğini de
paylaşmanız anlamına gelir.

## Klavye kısayolları

| Kısayol | İşlem |
| --- | --- |
| `Ctrl+N` | Yeni proje |
| `Ctrl+O` | Proje aç |
| `Ctrl+S` | Kaydet |
| `Ctrl+Shift+S` | Farklı kaydet |
| `Ctrl+Z` | Geri al |
| `Ctrl+Shift+Z` veya `Ctrl+Y` | Yinele |
| `Ctrl+K` | Komut paletini aç |
| `?` | Uygulama içi kısayol yardımını aç |
| Ok tuşları | Seçili kartı taşı |
| `Delete` / `Backspace` | Seçili bağlantıyı onay alarak sil |
| `Esc` | Destekleyen iletişim penceresini, paleti veya ayrıntı panelini kapat |

Metin girişi sırasında global kısayolların veya bağlantı silmenin istemeden
çalışmaması için yazı alanları ayrıca korunur.

## Geliştirme

### Teknoloji yığını

- **React 19 + TypeScript + Vite:** Arayüz ve üretim derlemesi
- **React Flow / XYFlow:** Tuval, kartlar ve ilişkiler
- **Zustand:** Proje, UI ve geri bildirim durumu
- **Zod:** Veri doğrulama ve şema geçişleri
- **Tauri 2 + Rust:** Masaüstü kabuğu, dosya seçicileri ve atomik kayıt
- **Vitest:** Otomatik frontend ve domain testleri

### Önkoşullar

Windows üzerinde geliştirmek için:

- Git
- Node.js 22 ve npm
- Stable Rust MSVC toolchain ve Cargo
- Microsoft C++ Build Tools içindeki **Desktop development with C++** bileşeni
- Microsoft Edge WebView2 Runtime

Node.js 22, otomatik sürüm akışında kullanılan ve proje için önerilen
sürümdür. Tauri'nin güncel sistem gereksinimleri için
[resmi önkoşul belgesine](https://v2.tauri.app/start/prerequisites/) bakın.

### Depoyu hazırlama

```powershell
git clone https://github.com/ogtknscn/gdd-tool.git
cd gdd-tool
npm ci
```

`npm ci`, `package-lock.json` içindeki sürümleri kullanarak tekrar üretilebilir
bir bağımlılık kurulumu yapar.

### Geliştirme modları

Yalnızca web arayüzünü çalıştırmak için:

```powershell
npm run dev
```

Tam Tauri masaüstü uygulamasını geliştirme modunda çalıştırmak için:

```powershell
npm run tauri dev
```

Web geliştirme modu dosya açma ve kaydetme gibi masaüstü davranışlarını tam
olarak temsil etmez. Dosya sistemi akışlarını doğrulamak için Tauri modunu
kullanın.

### Test ve derleme

```powershell
# Frontend/domain testleri
npm test

# Testleri izleme modu
npm run test:watch

# TypeScript ve üretim frontend derlemesi
npm run build

# Windows uygulaması ve NSIS kurulum paketi
npm run tauri build
```

Rust kontrolleri:

```powershell
cd src-tauri
cargo fmt --check
cargo check
cargo test
cd ..
```

Tauri derleme çıktıları `src-tauri/target/release/` altında oluşur. `target/`,
`dist/` ve yerel `artifacts/` klasörleri Git tarafından takip edilmez. Son
kullanıcılara yerel çıktılar yerine her zaman resmi
[GitHub Releases](https://github.com/ogtknscn/gdd-tool/releases/latest)
sayfasını yönlendirin.

### Kalite kontrolleri

Bir değişikliği paylaşmadan önce en az şu kontrollerin geçmesi beklenir:

```powershell
npm ci
npm test
npm run build

cd src-tauri
cargo fmt --check
cargo check
cargo test
cd ..
```

Windows dağıtımını etkileyen değişikliklerde ayrıca `npm run tauri build`
çalıştırın. Test paketi; proje store'u, veri göçü, kayıt, doğrulama, şablonlar,
komut paleti, başlık düzenleme, dialog sistemi, kart sürükleme uzlaştırması ve
ilişki silme davranışlarını kapsar. Ham `window.alert`, `window.confirm` ve
`window.prompt` kullanımının geri dönmesini engelleyen bir regresyon kontrolü
de bulunur.

## Mimari

```text
gdd-tool/
├─ .codex/                  Codex geliştirme agent tanımları
├─ .github/workflows/       GitHub Actions sürüm iş akışları
├─ docs/                    Araştırma ve geliştirme belgeleri
├─ examples/                Örnek geliştirme istekleri
├─ src/
│  ├─ commands/             Uygulama ve ilişki komutları
│  ├─ components/           React arayüz bileşenleri
│  ├─ domain/               Şema, veri göçü, doğrulama ve şablonlar
│  └─ stores/               Proje, arayüz ve geri bildirim durumları
├─ src-tauri/
│  ├─ src/                  Rust dosya ve uygulama komutları
│  └─ tauri.conf.json       Masaüstü ve paketleme yapılandırması
└─ test/                    Vitest testleri
```

### Katmanlar

- `src/domain`: UI'dan bağımsız proje modeli, Zod şemaları, veri göçü,
  doğrulama, tür alanları ve başlangıç şablonları
- `src/stores/projectStore.ts`: Proje mutasyonları, seçim, kaydedilme durumu,
  undo/redo ve aktif dosya bilgisi
- `src/stores/uiStore.ts`: Açık paneller, kart yoğunluğu, bağlantı modu ve
  tuval görünümü
- `src/stores/feedbackStore.ts`: Uygulama içi dialog ve bildirim kuyruğu
- `src/components`: Tuval, kartlar, paneller, dialoglar ve uygulama kabuğu
- `src-tauri/src/lib.rs`: Windows dosya seçicileri, proje açma, atomik kayıt ve
  kurtarma snapshot'ı
- `test`: Domain, store ve kritik UI davranışlarının otomatik kontrolleri

### Veri akışı

```text
Kullanıcı işlemi
    ↓
React bileşeni
    ↓
Zustand store mutasyonu
    ↓
V3 proje modeli
    ├─→ Zod doğrulama
    ├─→ Undo/redo geçmişi
    ├─→ Yerel kurtarma snapshot'ı
    └─→ Tauri üzerinden atomik .gdd.json kaydı
```

## Windows sürüm CI'ı

`.github/workflows/release.yml`, `v*` biçimindeki Git etiketleri gönderildiğinde
Windows sürümünü otomatik üretir:

1. Kaynak kodu temiz bir Windows runner'a alır.
2. Node.js 22 ve stable Rust kurar.
3. `npm ci` ve `npm test` çalıştırır.
4. Etiketin `package.json` sürümüyle eşleştiğini doğrular.
5. `src-tauri/tauri.conf.json` ve `package.json` sürümlerini karşılaştırır.
6. Tauri uygulamasını ve NSIS kurulum paketini derler.
7. Portable ve kurulum EXE'lerini hazırlar.
8. GitHub Release'i oluşturur veya mevcut Release varlıklarını günceller.

Yeni sürüm hazırlarken `package.json`, `package-lock.json`,
`src-tauri/tauri.conf.json` ve `src-tauri/Cargo.toml` sürümlerini birlikte
güncelleyin. Kontrolleri çalıştırıp değişiklikleri `main` dalına gönderdikten
sonra aynı sürümle etiket oluşturun:

```powershell
git tag -a v0.2.0 -m "GDD Tool v0.2.0"
git push origin v0.2.0
```

Etiket ve paket sürümü eşleşmezse CI, Release oluşturmadan hata verir. İş akışı
kişisel API anahtarı veya GitHub PAT kullanmaz; GitHub Actions'ın çalışma
sırasında sağladığı token'ı ve yalnızca Release yayımlamak için gereken
`contents: write` iznini kullanır.

## Codex geliştirme router'ı

Bu repodaki **Sol**, **Terra** ve **Luna** adları son kullanıcıya sunulan bir AI
sistemini ifade etmez. Bunlar yalnızca GDD Tool geliştirilirken Codex görevlerini
yönlendiren proje rolleridir.

1. Sol, ham geliştirme isteğini uygulanabilir bir execution brief'e dönüştürür.
2. Ana Codex oturumu kapsam ve riske göre yürütücüyü seçer.
3. Terra; araştırma, mimari, belirsiz veya çok dosyalı işleri yürütür.
4. Luna; net, mekanik ve düşük riskli işleri yürütür.
5. Ana oturum sonucu doğrular ve tamamlanmış çıktıyı teslim eder.

Bu router:

- Derlenen uygulamanın parçası değildir.
- Uygulama çalışırken model çağrısı yapmaz.
- OpenAI SDK veya API anahtarı gerektirmez.
- GDD proje verilerini bir AI servisine göndermez.

Ayrıntılar için [Geliştirme Router'ı](docs/DEVELOPMENT_ROUTER.md) belgesine
bakın.

## Bilinen sınırlar

Güncel erken sürümde:

- Hazır dağıtım yalnızca Windows x64 ve NSIS hedeflidir.
- Paketler henüz kod imzalama sertifikasıyla imzalanmaz.
- Otomatik uygulama güncellemesi bulunmaz.
- Bulut senkronizasyonu, hesap sistemi ve gerçek zamanlı ortak düzenleme yoktur.
- Ürün içinde AI özelliği yoktur.
- Proje tek bir `.gdd.json` snapshot'ı olarak kaydedilir; nesne bazlı Git diff
  biçimi henüz yoktur.
- Şablonlar yalnızca yeni proje başlangıç noktalarıdır.
- Semantik container/frame ve gelişmiş sayfa organizasyonu henüz yoktur.
- View/Edit/Play modları ve oynanabilir simülasyon bulunmaz.
- macOS ve Linux paketleri yayımlanmaz.

Erken sürüm dosya biçimi geriye uyumluluk gözetilerek geliştiriliyor olsa da
önemli proje dosyalarını ayrıca yedekleyin.

## Gelecek vizyonu

Uzun vadeli hedef, GDD Tool'u yapılandırılmış oyun tasarımı bilgisiyle Miro
benzeri serbest çalışma alanını birleştiren, çevrimdışı çalışan bir masaüstü
playground'a dönüştürmektir.

Araştırılan yönler:

- Açık sayfaya eklenebilen GDD şablonları ve modülleri
- Sistem, feature veya chapter gibi semantik container'lar
- Sayfalar arası portal ve referans kartları
- Gelişmiş arama, filtreleme ve outline organizasyonu
- View, Edit ve Play çalışma modlarının açık biçimde ayrılması
- Test edilebilir değişkenler, koşullar ve akışlar
- Tasarım fikirlerini çalıştırmaya yardımcı simülasyon görünümü
- Olay günlüğü ve çalışma anı doğrulaması
- Büyük projeler için performans ve sanallaştırma iyileştirmeleri
- Nesne bazlı, Git dostu proje depolama seçenekleri

Bu maddeler mevcut sürüm taahhüdü veya teslim tarihi değildir. Güncel kapsam
için **Mevcut özellikler** ve **Bilinen sınırlar** bölümlerini esas alın.
Arayüz araştırması ve aşamalı kararlar için
[Modern UI Araştırması](docs/MODERN_UI_RESEARCH.md) belgesine bakın.

## Katkıda bulunma

Projede henüz ayrı bir `CONTRIBUTING.md` veya resmî katkı süreci yoktur. Katkı
hazırlarken:

1. Değişikliği mevcut ürün sınırı içinde tutun.
2. Mümkünse önce bir issue ile amacı ve kapsamı netleştirin.
3. Küçük, odaklı bir değişiklik hazırlayın.
4. İlgili testleri ekleyin veya güncelleyin.
5. Frontend ve Rust kalite kontrollerini çalıştırın.
6. Gizli bilgi, API anahtarı veya kişisel dosya yolu commit etmeyin.
7. Değişikliği açıklayan bir pull request açın.

Kullanıcı açıkça istemedikçe ürün içine AI, model veya ağ bağımlılığı eklemeyin.

## Lisans

Bu depoda henüz bir `LICENSE` dosyası veya açık kaynak lisansı tanımlanmamıştır.
Kaynak kodun görüntülenebilir olması otomatik olarak yeniden dağıtım, değiştirme
veya ticari kullanım izni vermez. Kullanım ve katkı koşulları için proje
sahibinden açıklama alınmalıdır.
