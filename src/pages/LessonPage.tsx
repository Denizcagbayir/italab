import { useParams, Link } from 'react-router-dom';
import { getLesson, getUnit } from '../data/course';
import { LessonPlayer } from '../components/exercises/LessonPlayer';

export function LessonPage() {
  const { unitId = '', lessonId = '' } = useParams();
  const unit = getUnit(unitId);
  const lesson = getLesson(unitId, lessonId);

  if (!unit || !lesson) {
    return (
      <div className="page">
        <p>Ders bulunamadı.</p>
        <Link to="/path">Yola dön</Link>
      </div>
    );
  }

  return (
    <LessonPlayer lesson={lesson} unitTitle={unit.titleIt} />
  );
}
