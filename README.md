# ITAlab

Yerel çalışan İtalyanca A1–A2 öğrenme platformu (Duolingo tarzı ders yolu + pratik hub).

## Çalıştırma

```bash
cd italab
npm install
npm run dev
```

Tarayıcıda `http://localhost:5173` açılır.

## Ne var?

- **Öğrenme yolu:** A1–A2 müfredat haritası (Ünite 0 tam içerik)
- **Ders motoru:** eşleştirme, MCQ, cloze, kelime bankası, dikte, çeviri, çekim, konuşma (Web Speech)
- **Pratik Hub:** kelime (666+), artikel (888), fiil presente (606), SRS, hatalar
- **İlerleme:** XP, seri, beceri çubukları, JSON yedek

## Ses

HTML alıştırmalarındaki mantık: İtalyanca sesler (Google italiano / Microsoft Elsa / Cosimo öncelikli), Rocko/Sandy elenir. Ayarlar’dan ses seç + test et.

Konuşma tanıma için Chrome veya Edge önerilir (mikrofon izni gerekir).

## Yapı

İçerik `src/data/units/` ve `src/data/course.ts` içinde. Müfredat kaynağı: `../italyanca_a1_a2_yazilima_uygun_egitim_mufredati.md`.
