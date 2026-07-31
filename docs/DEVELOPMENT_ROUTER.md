# Sol → Terra/Luna geliştirme router'ı

Bu router GDD Tool'un bir özelliği değildir. Codex içinde bu repoyu geliştirirken
iş bölümünü standartlaştırır.

## Akış

```text
Kullanıcı isteği
      │
      ▼
Sol: Execution Brief
      │
      ▼
Ana Codex oturumu: rota kararı
      ├───────────────┐
      ▼               ▼
Terra              Luna
araştırma,         net ve dar
mimari, sentez     işler
      └───────┬───────┘
              ▼
       Ana oturum kontrolü
              ▼
          Nihai sonuç
```

## Rota kararı

Ana oturum aşağıdaki sinyallerden biri güçlüyse Terra'yı seçer:

- canlı internet veya rakip araştırması,
- birden fazla kaynağı karşılaştırıp sentezleme,
- ürün stratejisi veya mimari kararı,
- belirsiz kabul kriterleri,
- birden fazla bileşen ya da dosyada koordineli değişiklik,
- yüksek hata maliyeti veya kapsamlı test ihtiyacı.

Luna yalnızca hedefi ve kabul kriteri açık, dar ve düşük riskli görevlerde
seçilir. Luna sırasında kapsam büyürse görev Terra'ya yükseltilir.

## Örnekler

| İstek | Rota | Neden |
| --- | --- | --- |
| “GDD araçları için güncel rakip araştırması yap.” | Terra | Canlı web, çok kaynak ve sentez |
| “Bu araştırmadan özellik matrisi çıkar.” | Luna | Kaynak veri hazır, işlem net |
| “Ortak düzenleme mimarisini tasarla ve uygula.” | Terra | Mimari ve çok bileşenli uygulama |
| “README'deki yazım hatalarını düzelt.” | Luna | Dar ve mekanik |

## Kullanım

Ekip üyesi `gdd-tool` klasörünü Codex'te açar ve ChatGPT hesabıyla giriş yapar.
Ardından görevi normal konuşma diliyle yazar. `AGENTS.md` router davranışını,
`.codex/agents/` dosyaları ise proje kapsamlı agent rollerini tanımlar.

API anahtarı veya ürün koduna eklenecek bir AI paketi gerekmez. Her ekip üyesi
kendi Codex oturumu ve plan limitleriyle çalışır.
