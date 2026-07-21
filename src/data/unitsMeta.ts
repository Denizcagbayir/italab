/** Unit metadata + pass rules for curriculum v2 (assessments live alongside JSON lessons). */

export type UnitMeta = {
  id: string;
  level: 'A1' | 'A2';
  order: number;
  titleIt: string;
  titleTr: string;
  outcomeTr: string;
  grammarFocus: string[];
  missionTr: string;
  bookPages: string;
  grammarPages: string;
};

/** Shared lesson pass rule from müfredat §12A / mastery model. */
export const LESSON_PASS = {
  miniCheckMinCorrect: 2,
  miniCheckTotal: 3,
  estimatedMinutesTeaching: 18,
} as const;

export const UNIT_META: UnitMeta[] = [
  {
    id: 'UNT-A1-00-BENVENUTI',
    level: 'A1',
    order: 0,
    titleIt: 'Benvenuti!',
    titleTr: 'Hoş geldiniz',
    outcomeTr: 'Tanışmak ve temel bilgi vermek',
    grammarFocus: ['isim/sıfat uyumu', 'artikeller', 'essere', 'avere'],
    missionTr:
      'Bir sınıf arkadaşınla kısa bir tanışma diyaloğu kur: selamlaş, adını söyle, nereli olduğunu belirt.',
    bookPages: '5–14',
    grammarPages: '191–194',
  },
  {
    id: 'UNT-A1-01-NUOVO-INIZIO',
    level: 'A1',
    order: 1,
    titleIt: 'Un nuovo inizio',
    titleTr: 'Yeni bir başlangıç',
    outcomeTr: 'Yeni iş/okul bağlamında bilgi alışverişi',
    grammarFocus: ['düzenli presente', 'belirsiz artikel', 'Lei', 'da + süre'],
    missionTr:
      'Yeni bir işe/okula başlayan biriyle konuş: ne iş yaptığını, nerede yaşadığını ve ne zamandır orada olduğunu sor/anlat.',
    bookPages: '15–28',
    grammarPages: '195–196',
  },
  {
    id: 'UNT-A1-02-TEMPO-LIBERO',
    level: 'A1',
    order: 2,
    titleIt: 'Tempo libero',
    titleTr: 'Boş zaman',
    outcomeTr: 'Davet etmek, plan ve saat konuşmak',
    grammarFocus: ['düzensiz presente', 'modal fiiller', 'edatlar'],
    missionTr:
      'Arkadaşını bir aktiviteye davet et; saat ve yer öner, kabul veya nazikçe red et.',
    bookPages: '29–42',
    grammarPages: '196–200',
  },
  {
    id: 'UNT-A1-03-IN-CONTATTO',
    level: 'A1',
    order: 3,
    titleIt: 'In contatto',
    titleTr: 'İletişimde',
    outcomeTr: 'İletişim kurmak, yer ve sahiplik belirtmek',
    grammarFocus: ['birleşik edatlar', 'partitivo', "c'è/ci sono"],
    missionTr:
      'Telefonda veya mesajda buluşma ayarla: nerede olduğunuzu, nasıl gideceğinizi ve ne getireceğinizi söyleyin.',
    bookPages: '43–56',
    grammarPages: '199–203',
  },
  {
    id: 'UNT-A1-04-BUON-FINE-SETTIMANA',
    level: 'A1',
    order: 4,
    titleIt: 'Buon fine settimana!',
    titleTr: 'İyi hafta sonu',
    outcomeTr: 'Geçen hafta sonunu anlatmak',
    grammarFocus: ['passato prossimo', 'ci', 'geçmiş ortaç'],
    missionTr:
      'Geçen hafta sonunu anlat: nereye gittin, ne yaptın, kiminle birlikteydin (passato prossimo).',
    bookPages: '57–72',
    grammarPages: '203–206',
  },
  {
    id: 'UNT-A1-05-TEMPO-DI-VACANZE',
    level: 'A1',
    order: 5,
    titleIt: 'Tempo di vacanze',
    titleTr: 'Tatil zamanı',
    outcomeTr: 'Seyahat planı ve hava durumu',
    grammarFocus: ['futuro', 'koşul I'],
    missionTr:
      'Yakın bir tatil planı anlat veya öner: nereye gideceksiniz, ne yapacaksınız, hava nasıl olacak.',
    bookPages: '73–86',
    grammarPages: '206–207',
  },
  {
    id: 'UNT-A2-06-A-CENA-FUORI',
    level: 'A2',
    order: 6,
    titleIt: 'A cena fuori',
    titleTr: 'Dışarıda yemek',
    outcomeTr: 'Aileden söz etmek ve restoranda sipariş',
    grammarFocus: ['possessivi', 'piacere', 'volerci/metterci'],
    missionTr:
      'Aileni kısaca tanıt ve restoranda sipariş ver / tercihlerini söyle (ne sevdiğini belirt).',
    bookPages: '87–100',
    grammarPages: '207–209',
  },
  {
    id: 'UNT-A2-07-AL-CINEMA',
    level: 'A2',
    order: 7,
    titleIt: 'Al cinema',
    titleTr: 'Sinemada',
    outcomeTr: 'Anı, alışkanlık ve geçmiş olay anlatmak',
    grammarFocus: ['imperfetto', 'passato prossimo', 'trapassato'],
    missionTr:
      'Bir film/anı anlat: eskiden ne yapardın (imperfetto) ve o akşam ne oldu (passato prossimo).',
    bookPages: '101–114',
    grammarPages: '209–210',
  },
  {
    id: 'UNT-A2-08-FARE-LA-SPESA',
    level: 'A2',
    order: 8,
    titleIt: 'Fare la spesa',
    titleTr: 'Market alışverişi',
    outcomeTr: 'Market alışverişi ve miktar belirtmek',
    grammarFocus: ['pronomi diretti', 'ne', "ce l'ho"],
    missionTr:
      'Market listesi yap ve tezgâhta miktar sor/iste (ne, miktar ifadeleri, doğrudan zamir).',
    bookPages: '115–130',
    grammarPages: '210–212',
  },
  {
    id: 'UNT-A2-09-FARE-SPESE',
    level: 'A2',
    order: 9,
    titleIt: 'Andiamo a fare spese',
    titleTr: 'Alışverişe gidelim',
    outcomeTr: 'Kıyafet almak ve görüş bildirmek',
    grammarFocus: ['riflessivi', 'impersonale'],
    missionTr:
      'Mağazada kıyafet dene/yorumla: beden, renk, fiyat; dönüşlü fiiller ve kişisiz si kullan.',
    bookPages: '131–146',
    grammarPages: '212–213',
  },
  {
    id: 'UNT-A2-10-TV',
    level: 'A2',
    order: 10,
    titleIt: "Che c'è stasera in TV?",
    titleTr: 'Bu akşam TV’de ne var?',
    outcomeTr: 'Rica, öneri, yön ve medya konuşmak',
    grammarFocus: ['pronomi indiretti', 'imperativo'],
    missionTr:
      'Bir programa öneri ver veya yol tarifi/rica et (dolaylı zamir + emir).',
    bookPages: '147–162',
    grammarPages: '213–216',
  },
  {
    id: 'UNT-A2-11-MUSICA',
    level: 'A2',
    order: 11,
    titleIt: 'A ritmo di musica',
    titleTr: 'Müziğin ritminde',
    outcomeTr: 'Kibar istek, tavsiye ve varsayım',
    grammarFocus: ['condizionale'],
    missionTr:
      'Kibar bir istek veya tavsiye söyle (condizionale): konser, müzik tercihi veya nazik öneri.',
    bookPages: '163–176',
    grammarPages: '216–217',
  },
];

export const UNIT_META_BY_ID = Object.fromEntries(
  UNIT_META.map((u) => [u.id, u]),
) as Record<string, UnitMeta>;
