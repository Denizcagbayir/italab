/**
 * Course API — curriculum v2 (84 teaching lessons + unit missions).
 * Legacy per-unit TS files remain in src/data/units/ for reference only.
 */
export {
  COURSE_MAP,
  UNITS,
  UNIT_SEQUENCE_UNLOCK as UNIT_SEQUENCE,
  getUnit,
  getLesson,
  getUnitMeta,
  getTeachingLesson,
  lessonsForUnit,
  isUnitComplete,
  nextUnitId,
  getContinueLesson,
  skillsFromTeaching,
  CURRICULUM_STATS,
  TEACHING_LESSONS,
  SCREEN_SCHEMA,
  type TeachingLesson,
  type TeachingCheck,
} from './courseV2';
