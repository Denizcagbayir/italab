import type { CourseMapUnit, Unit } from '../types/curriculum';
import { unitA100 } from './units/a1-00-benvenuti';
import { unitA101 } from './units/a1-01-nuovo-inizio';
import { unitA102 } from './units/a1-02-tempo-libero';
import { unitA103 } from './units/a1-03-in-contatto';
import { unitA104 } from './units/a1-04-buon-fine-settimana';
import { unitA105 } from './units/a1-05-tempo-di-vacanze';
import { unitChkA1 } from './units/chk-a1-final';
import { unitA206 } from './units/a2-06-a-cena-fuori';
import { unitA207 } from './units/a2-07-al-cinema';
import { unitA208 } from './units/a2-08-fare-la-spesa';
import { unitA209 } from './units/a2-09-fare-spese';
import { unitA210 } from './units/a2-10-tv';
import { unitA211 } from './units/a2-11-musica';
import { unitChkA2 } from './units/chk-a2-final';

/** Full A1–A2 map from the approved müfredat. */
export const COURSE_MAP: CourseMapUnit[] = [
  {
    id: 'UNT-A1-00-BENVENUTI',
    level: 'A1',
    order: 0,
    titleIt: 'Benvenuti!',
    titleTr: 'Hoş geldiniz',
    outcomeTr: 'Tanışmak ve temel bilgi vermek',
    grammarFocus: ['isim/sıfat uyumu', 'artikeller', 'essere', 'avere'],
    available: true,
    lessonCount: 8,
  },
  {
    id: 'UNT-A1-01-NUOVO-INIZIO',
    level: 'A1',
    order: 1,
    titleIt: 'Un nuovo inizio',
    titleTr: 'Yeni bir başlangıç',
    outcomeTr: 'Yeni iş/okul bağlamında bilgi alışverişi',
    grammarFocus: ['düzenli presente', 'belirsiz artikel', 'Lei', 'da + süre'],
    available: true,
    lessonCount: 8,
  },
  {
    id: 'UNT-A1-02-TEMPO-LIBERO',
    level: 'A1',
    order: 2,
    titleIt: 'Tempo libero',
    titleTr: 'Boş zaman',
    outcomeTr: 'Davet etmek, plan ve saat konuşmak',
    grammarFocus: ['düzensiz presente', 'modal fiiller', 'edatlar'],
    available: true,
    lessonCount: 8,
  },
  {
    id: 'UNT-A1-03-IN-CONTATTO',
    level: 'A1',
    order: 3,
    titleIt: 'In contatto',
    titleTr: 'İletişimde',
    outcomeTr: 'İletişim kurmak, yer ve sahiplik belirtmek',
    grammarFocus: ['birleşik edatlar', 'partitivo', "c'è/ci sono"],
    available: true,
    lessonCount: 8,
  },
  {
    id: 'UNT-A1-04-BUON-FINE-SETTIMANA',
    level: 'A1',
    order: 4,
    titleIt: 'Buon fine settimana!',
    titleTr: 'İyi hafta sonu',
    outcomeTr: 'Geçen hafta sonunu anlatmak',
    grammarFocus: ['passato prossimo', 'ci', 'geçmiş ortaç'],
    available: true,
    lessonCount: 8,
  },
  {
    id: 'UNT-A1-05-TEMPO-DI-VACANZE',
    level: 'A1',
    order: 5,
    titleIt: 'Tempo di vacanze',
    titleTr: 'Tatil zamanı',
    outcomeTr: 'Seyahat planı ve hava durumu',
    grammarFocus: ['futuro', 'koşul I'],
    available: true,
    lessonCount: 8,
  },
  {
    id: 'CHK-A1-FINAL',
    level: 'A1',
    order: 6,
    titleIt: 'A1 Checkpoint',
    titleTr: 'A1 Kontrol Noktası',
    outcomeTr: 'A1 bütünleşik performans',
    grammarFocus: ['A1 tekrar'],
    available: true,
    lessonCount: 1,
  },
  {
    id: 'UNT-A2-06-A-CENA-FUORI',
    level: 'A2',
    order: 7,
    titleIt: 'A cena fuori',
    titleTr: 'Dışarıda yemek',
    outcomeTr: 'Aileden söz etmek ve restoranda sipariş',
    grammarFocus: ['possessivi', 'piacere', 'volerci/metterci'],
    available: true,
    lessonCount: 8,
  },
  {
    id: 'UNT-A2-07-AL-CINEMA',
    level: 'A2',
    order: 8,
    titleIt: 'Al cinema',
    titleTr: 'Sinemada',
    outcomeTr: 'Anı, alışkanlık ve geçmiş olay anlatmak',
    grammarFocus: ['imperfetto', 'passato prossimo', 'trapassato'],
    available: true,
    lessonCount: 8,
  },
  {
    id: 'UNT-A2-08-FARE-LA-SPESA',
    level: 'A2',
    order: 9,
    titleIt: 'Fare la spesa',
    titleTr: 'Market alışverişi',
    outcomeTr: 'Market alışverişi ve miktar belirtmek',
    grammarFocus: ['pronomi diretti', 'ne', "ce l'ho"],
    available: true,
    lessonCount: 8,
  },
  {
    id: 'UNT-A2-09-FARE-SPESE',
    level: 'A2',
    order: 10,
    titleIt: 'Andiamo a fare spese',
    titleTr: 'Alışverişe gidelim',
    outcomeTr: 'Kıyafet almak ve görüş bildirmek',
    grammarFocus: ['riflessivi', 'impersonale'],
    available: true,
    lessonCount: 8,
  },
  {
    id: 'UNT-A2-10-TV',
    level: 'A2',
    order: 11,
    titleIt: "Che c'è stasera in TV?",
    titleTr: 'Bu akşam TV’de ne var?',
    outcomeTr: 'Rica, öneri, yön ve medya konuşmak',
    grammarFocus: ['pronomi indiretti', 'imperativo'],
    available: true,
    lessonCount: 8,
  },
  {
    id: 'UNT-A2-11-MUSICA',
    level: 'A2',
    order: 12,
    titleIt: 'A ritmo di musica',
    titleTr: 'Müziğin ritminde',
    outcomeTr: 'Kibar istek, tavsiye ve varsayım',
    grammarFocus: ['condizionale'],
    available: true,
    lessonCount: 8,
  },
  {
    id: 'CHK-A2-FINAL',
    level: 'A2',
    order: 13,
    titleIt: 'A2 Checkpoint',
    titleTr: 'A2 Kontrol Noktası',
    outcomeTr: 'A2 bütünleşik performans',
    grammarFocus: ['A1-A2 tekrar'],
    available: true,
    lessonCount: 1,
  },
];

export const UNIT_SEQUENCE = [
  'UNT-A1-00-BENVENUTI',
  'UNT-A1-01-NUOVO-INIZIO',
  'UNT-A1-02-TEMPO-LIBERO',
  'UNT-A1-03-IN-CONTATTO',
  'UNT-A1-04-BUON-FINE-SETTIMANA',
  'UNT-A1-05-TEMPO-DI-VACANZE',
  'CHK-A1-FINAL',
  'UNT-A2-06-A-CENA-FUORI',
  'UNT-A2-07-AL-CINEMA',
  'UNT-A2-08-FARE-LA-SPESA',
  'UNT-A2-09-FARE-SPESE',
  'UNT-A2-10-TV',
  'UNT-A2-11-MUSICA',
  'CHK-A2-FINAL',
] as const;

export const UNITS: Record<string, Unit> = {
  'UNT-A1-00-BENVENUTI': unitA100,
  'UNT-A1-01-NUOVO-INIZIO': unitA101,
  'UNT-A1-02-TEMPO-LIBERO': unitA102,
  'UNT-A1-03-IN-CONTATTO': unitA103,
  'UNT-A1-04-BUON-FINE-SETTIMANA': unitA104,
  'UNT-A1-05-TEMPO-DI-VACANZE': unitA105,
  'CHK-A1-FINAL': unitChkA1,
  'UNT-A2-06-A-CENA-FUORI': unitA206,
  'UNT-A2-07-AL-CINEMA': unitA207,
  'UNT-A2-08-FARE-LA-SPESA': unitA208,
  'UNT-A2-09-FARE-SPESE': unitA209,
  'UNT-A2-10-TV': unitA210,
  'UNT-A2-11-MUSICA': unitA211,
  'CHK-A2-FINAL': unitChkA2,
};

export function getUnit(id: string): Unit | null {
  return UNITS[id] ?? null;
}

export function getLesson(unitId: string, lessonId: string) {
  const unit = getUnit(unitId);
  return unit?.lessons.find((l) => l.id === lessonId) ?? null;
}

export function isUnitComplete(
  unitId: string,
  lessonsProgress: Record<string, { completed?: boolean }>,
): boolean {
  const unit = getUnit(unitId);
  if (!unit) return false;
  return unit.lessons.every((l) => lessonsProgress[l.id]?.completed);
}

export function nextUnitId(unitId: string): string | null {
  const i = UNIT_SEQUENCE.indexOf(unitId as (typeof UNIT_SEQUENCE)[number]);
  if (i < 0 || i >= UNIT_SEQUENCE.length - 1) return null;
  return UNIT_SEQUENCE[i + 1];
}

export function getContinueLesson(
  lessonsProgress: Record<string, { completed?: boolean }>,
  unlockedUnits: string[],
) {
  for (const id of UNIT_SEQUENCE) {
    if (!unlockedUnits.includes(id)) continue;
    const unit = getUnit(id);
    if (!unit) continue;
    const next = unit.lessons.find((l) => !lessonsProgress[l.id]?.completed);
    if (next) return { unit, lesson: next };
  }
  for (let i = UNIT_SEQUENCE.length - 1; i >= 0; i--) {
    const unit = getUnit(UNIT_SEQUENCE[i]);
    if (unit && unlockedUnits.includes(unit.id)) {
      return { unit, lesson: unit.lessons[unit.lessons.length - 1] };
    }
  }
  return null;
}
