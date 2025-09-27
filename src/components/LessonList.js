import React from 'react';
import { useTranslation } from 'react-i18next';
import { formatDate, formatTime } from '../utils/dateUtils';
import TimeSelector from './TimeSelector';
import LessonStatusSelector from './LessonStatusSelector';

const LessonList = ({ lessons, onToggleLesson, onUpdateLessonTime, onToggleLessonCancellation, onLessonStatusChange }) => {
  const { t } = useTranslation();
  
  if (!lessons || lessons.length === 0) {
    return (
      <div className="text-gray-500 text-sm italic">
        {t('lessons.noLessonsThisWeek')}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium text-gray-700 mb-3">{t('lessons.thisWeeksSchedule')}:</h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {lessons.map((lesson) => (
          <div
            key={lesson.id}
            className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
              lesson.cancelled 
                ? 'bg-red-50 border border-red-200' 
                : lesson.completed
                ? 'bg-green-50 border border-green-200'
                : 'bg-gray-50 hover:bg-gray-100'
            }`}
          >
            <LessonStatusSelector
              lesson={lesson}
              onStatusChange={(status) => onLessonStatusChange(lesson.id, status)}
            />
            
            <div className="flex-1 min-w-0">
              <div className={`text-sm font-medium ${
                lesson.cancelled ? 'text-red-600 line-through' : 'text-gray-900'
              }`}>
                {lesson.dayName}
                {lesson.cancelled && ` (${t('lessons.cancelled')})`}
              </div>
              <div className="text-xs text-gray-500">
                {formatDate(lesson.date)}
              </div>
            </div>
            
            <TimeSelector
              value={formatTime(lesson.time)}
              onChange={onUpdateLessonTime}
              lessonId={lesson.id}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default LessonList;
