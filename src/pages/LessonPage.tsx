import { useParams, Link } from 'react-router-dom';
import { getLesson, getUnit, getTeachingLesson } from '../data/course';
import { LessonPlayer } from '../components/exercises/LessonPlayer';
import {
  TeachingPlayer,
  MissionPlayer,
} from '../components/teaching/TeachingPlayer';

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

  if (lesson.kind === 'teaching' || getTeachingLesson(lessonId)) {
    return <TeachingPlayer unitId={unitId} lessonId={lessonId} />;
  }

  if (lesson.kind === 'mission') {
    return (
      <MissionPlayer
        unitId={unitId}
        lessonId={lesson.id}
        kind="mission"
        title={lesson.titleTr}
        body={lesson.goalsTr[0] ?? lesson.titleTr}
      />
    );
  }

  if (lesson.kind === 'exam') {
    return (
      <MissionPlayer
        unitId={unitId}
        lessonId={lesson.id}
        kind="exam"
        title={lesson.titleTr}
        body={lesson.goalsTr[0] ?? lesson.titleTr}
      />
    );
  }

  return <LessonPlayer lesson={lesson} unitTitle={unit.titleIt} />;
}
