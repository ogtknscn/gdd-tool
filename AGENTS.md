# GDD Tool geliştirme talimatları

## Ürün sınırı

- GDD Tool ürününe kullanıcı açıkça istemedikçe AI, LLM, OpenAI API, Codex SDK
  veya model bağımlılığı ekleme.
- Sol, Terra ve Luna yalnızca bu repoyu geliştirirken kullanılan Codex
  agentlarıdır; ürün mimarisinin parçası değildir.

## Zorunlu geliştirme router'ı

Kodlama, araştırma, planlama, tasarım veya dokümantasyon isteyen her esaslı
görevde aşağıdaki akışı uygula:

1. Ham kullanıcı isteğini `sol_prompt_architect` agentına gönder.
2. Sol'dan gelen `Execution Brief`i incele. Sol işi yürütmez ve yürütücü
   seçimini bağlayıcı biçimde yapmaz.
3. Son yönlendirme kararını ana agent verir:
   - `terra_worker`: internet/rakip araştırması, ürün stratejisi, mimari,
     belirsiz gereksinimler, birden fazla bileşen veya dosya, önemli tasarım
     kararı, kapsamlı doğrulama ya da güçlü sentez gereken işler.
   - `luna_worker`: kapsamı net, düşük riskli, tekrarlanabilir, mekanik veya
     küçük değişiklikler; veri çıkarma, biçimlendirme, sınıflandırma, kısa
     özetleme ve açık kabul kriterli dar görevler.
4. Seçilen workera Sol'un `Execution Brief`ini eksiksiz aktar.
5. Worker sonucunu ana agent doğrular. Eksik veya riskli bir sonuç varsa aynı
   workera hedefli düzeltme ver; gerekirse Luna görevini Terra'ya yükselt.
6. Kullanıcıya Sol ile worker arasındaki ham mesajları değil, nihai sonucu ve
   seçilen rotayı kısa biçimde bildir.

Basit sohbet, durum sorusu veya yalnızca mevcut bir bilgiyi açıklama isteği için
agent başlatma.

## Araştırma standardı

- Güncel bilgi veya internet araştırması isteyen görevleri Terra'ya yönlendir.
- Birincil kaynakları tercih et; ürün iddialarını bağımsız kaynaklardan ayır.
- Önemli güncel iddiaları bağlantılarla destekle.
- Olgu, kullanıcı yorumu ve çıkarımı birbirine karıştırma.
- Çıktıyı GDD Tool için uygulanabilir karar veya sonraki adıma bağla.

## Uygulama standardı

- Önce repodaki mevcut yapıyı incele; kullanıcı değişikliklerini koru.
- İstenen kapsam dışına çıkma.
- Değişiklikleri ilgili testlerle doğrula.
- Dış yazma, yıkıcı işlem veya önemli kapsam genişlemesi için kullanıcı onayı
  iste.
