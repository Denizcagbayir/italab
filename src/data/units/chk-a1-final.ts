import type { Unit } from '../../types/curriculum';

const U = 'CHK-A1-FINAL';

export const unitChkA1: Unit = {
  id: U,
  level: 'A1',
  order: 6,
  slug: 'a1-checkpoint',
  titleIt: 'A1 Checkpoint',
  titleTr: 'A1 Kontrol Noktası',
  outcomeTr:
    'A1 seviyesinde öğrenilen tüm üniteleri (0-5) bütünleşik olarak kullanarak tanışma, davet, iletişim, geçmiş anlatım ve gelecek planlarını karıştırarak göster.',
  grammarFocus: [
    'essere / avere ve artikeller',
    'düzensiz presente ve modal fiiller',
    'birleşik edatlar, partitivo, c’è/ci sono',
    'passato prossimo (essere/avere)',
    'futuro semplice ve birinci tip koşul',
  ],
  vocabFocus: [
    'tanışma',
    'iş ve boş zaman',
    'iletişim ve yer',
    'hafta sonu ve kafe',
    'seyahat ve hava durumu',
  ],
  estimatedHours: '3-4 saat',
  lessons: [
    {
      id: 'LSN-CHK-A1-FINAL-01',
      unitId: U,
      order: 1,
      titleIt: 'Revisione generale A1',
      titleTr: 'A1 genel tekrar sınavı',
      goalsTr: [
        'Ünite 0-5 dil bilgisini karışık olarak uygulama',
        'A1 bütünleşik performans değerlendirmesi',
      ],
      estimatedMinutes: 30,
      exercises: [
        {
          id: 'ACT-CHK-A1-FINAL-01-01-EXPLAIN',
          type: 'EXPLAIN',
          skills: ['grammar', 'reading'],
          promptTr: 'A1 genel tekrar',
          explanation:
            'Bu sınav, Benvenuti’den Tempo di vacanze’ye kadar (Ünite 0-5) öğrendiğin her şeyi karışık olarak test eder: essere/avere, artikeller, düzenli/düzensiz presente, modal fiiller, edatlar, partitivo, c’è/ci sono, passato prossimo ve futuro semplice.\n\nHer soruyu dikkatlice oku; bazı sorular birden fazla üniteden yapı birleştirir.',
        },
        {
          id: 'ACT-CHK-A1-FINAL-01-02-CONJ',
          type: 'CONJUGATE',
          skills: ['grammar'],
          promptTr: 'essere — loro (Ünite 0)',
          lemma: 'essere',
          person: 'loro',
          acceptedAnswers: ['sono'],
        },
        {
          id: 'ACT-CHK-A1-FINAL-01-03-CLOZE',
          type: 'CLOZE',
          skills: ['grammar', 'writing'],
          promptTr: 'Belirsiz artikel testi (Ünite 1)',
          blanks: [
            { before: 'Lavoro in ', after: ' ufficio.', answer: 'un' },
            { before: 'Studio in ', after: ' agenzia.', answer: "un'" },
          ],
          acceptedAnswers: ['un', "un'"],
        },
        {
          id: 'ACT-CHK-A1-FINAL-01-04-CONJ',
          type: 'CONJUGATE',
          skills: ['grammar'],
          promptTr: 'venire — noi (Ünite 2)',
          lemma: 'venire',
          person: 'noi',
          acceptedAnswers: ['veniamo'],
        },
        {
          id: 'ACT-CHK-A1-FINAL-01-05-MCQ',
          type: 'MCQ',
          skills: ['grammar'],
          promptTr: 'Doğru hangisi? (Ünite 2 — modal + mastar)',
          options: [
            'Non posso venire: devo studiare.',
            'Non posso venire: studio.',
            'Non posso vengo: devo studiare.',
          ],
          acceptedAnswers: ['Non posso venire: devo studiare.'],
        },
        {
          id: 'ACT-CHK-A1-FINAL-01-06-CLOZE',
          type: 'CLOZE',
          skills: ['grammar', 'writing'],
          promptTr: 'Birleşik edat testi (Ünite 3)',
          blanks: [
            { before: 'Il libro è ', after: ' tavolo.', answer: 'sul' },
            { before: 'Vado ', after: ' biblioteca.', answer: 'alla' },
          ],
          acceptedAnswers: ['sul', 'alla'],
        },
        {
          id: 'ACT-CHK-A1-FINAL-01-07-CLOZE',
          type: 'CLOZE',
          skills: ['grammar', 'writing'],
          promptTr: "Partitivo ve c'è testi (Ünite 3)",
          blanks: [
            { before: 'Compro ', after: ' pane.', answer: 'del' },
            { before: 'In cucina ', after: ' un tavolo.', answer: "c'è" },
          ],
          acceptedAnswers: ['del', "c'è"],
        },
        {
          id: 'ACT-CHK-A1-FINAL-01-08-TRANSFORM',
          type: 'TRANSFORM',
          skills: ['grammar', 'writing'],
          promptTr: 'Hatayı düzelt (Ünite 4 — essere/avere seçimi)',
          transformFrom: 'Ieri io ho andato al cinema.',
          acceptedAnswers: ['Ieri io sono andato al cinema.', 'Ieri io sono andata al cinema.'],
        },
        {
          id: 'ACT-CHK-A1-FINAL-01-09-CONJ',
          type: 'CONJUGATE',
          skills: ['grammar'],
          promptTr: 'fare (passato prossimo) — noi (Ünite 4)',
          lemma: 'fare',
          person: 'noi',
          acceptedAnswers: ['abbiamo fatto'],
        },
        {
          id: 'ACT-CHK-A1-FINAL-01-10-CONJ',
          type: 'CONJUGATE',
          skills: ['grammar'],
          promptTr: 'andare (futuro) — loro (Ünite 5)',
          lemma: 'andare',
          person: 'loro',
          acceptedAnswers: ['andranno'],
        },
        {
          id: 'ACT-CHK-A1-FINAL-01-11-CLOZE',
          type: 'CLOZE',
          skills: ['grammar', 'writing'],
          promptTr: 'Birinci tip koşul testi (Ünite 5)',
          blanks: [
            { before: 'Se ', after: ' bel tempo, andremo al mare. (fare)', answer: 'farà' },
          ],
          acceptedAnswers: ['farà'],
        },
        {
          id: 'ACT-CHK-A1-FINAL-01-12-DIALOGUE',
          type: 'DIALOGUE_CHOICE',
          skills: ['reading'],
          promptTr: 'Daveti nazikçe reddet ve alternatif sun (Ünite 2-3 karışık)',
          dialogue: [{ speaker: 'Amico', text: 'Vuoi venire al bar stasera?' }],
          options: [
            'Mi dispiace, non posso: devo lavorare. Ci vediamo domani?',
            'No.',
            'Sono al bar.',
          ],
          acceptedAnswers: ['Mi dispiace, non posso: devo lavorare. Ci vediamo domani?'],
        },
        {
          id: 'ACT-CHK-A1-FINAL-01-13-FREE',
          type: 'FREE_TRANSLATION',
          skills: ['writing'],
          promptTr: 'Çevir: “Altı aydır İtalyanca çalışıyorum ve arkadaşlarımla sık sık dışarı çıkıyorum.”',
          acceptedAnswers: [
            'Studio l’italiano da sei mesi e esco spesso con i miei amici.',
            "Studio l'italiano da sei mesi e esco spesso con i miei amici.",
          ],
        },
        {
          id: 'ACT-CHK-A1-FINAL-01-14-OPEN',
          type: 'OPEN_SPEAK',
          skills: ['speaking'],
          promptTr:
            'A1 final görevi (60-90 sn): Kendini tanıt, geçen hafta sonunu anlat ve gelecek hafta sonu planını söyle.',
          audioText:
            'Mi chiamo Ayşe. Il fine settimana scorso sono andata al cinema con un’amica. Il prossimo fine settimana, se farà bel tempo, andremo al mare.',
          acceptedAnswers: ['mi chiamo', 'sono andata', 'andremo'],
          targetCoverage: ['mi chiamo'],
        },
      ],
    },
  ],
};
