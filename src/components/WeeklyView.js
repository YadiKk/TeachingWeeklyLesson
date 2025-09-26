import React from 'react';
import { formatDate, formatTime } from '../utils/dateUtils';
import TimeSelector from './TimeSelector';
import LessonStatusSelector from './LessonStatusSelector';

const WeeklyView = ({ weeklyView, onToggleLesson, onUpdateLessonTime, onToggleLessonCancellation, onLessonStatusChange }) => {
  return (
    <div className="space-y-3">
      <h4 className="text-md font-medium text-gray-700">Bu Haftanın Programı</h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-2">
        {weeklyView.map((dayData) => (
          <div
            key={dayData.dayOfWeek}
            className={`p-3 rounded-lg border transition-colors ${
              dayData.hasLesson
                ? dayData.lesson.cancelled 
                  ? 'status-cancelled' 
                  : dayData.lesson.completed
                  ? 'status-completed'
                  : 'status-pending'
                : 'bg-gray-50 border-gray-200'
            }`}
          >
            <div className="text-center">
              <div className="text-sm font-medium text-gray-900 mb-1">
                {dayData.dayName}
              </div>
              <div className="text-xs text-gray-500 mb-2">
                {formatDate(dayData.date)}
              </div>
              
              {dayData.hasLesson ? (
                <div className="space-y-2">
                  <LessonStatusSelector
                    lesson={dayData.lesson}
                    onStatusChange={(status) => onLessonStatusChange(dayData.lesson.id, status)}
                  />
                  
                  <div className="text-xs">
                    <div className={`font-medium ${
                      dayData.lesson.cancelled ? 'text-red-600 line-through' : 'text-gray-900'
                    }`}>
                      {dayData.lesson.cancelled ? 'İptal' : 'Planlandı'}
                    </div>
                  </div>
                  
                  <TimeSelector
                    value={formatTime(dayData.lesson.time)}
                    onChange={onUpdateLessonTime}
                    lessonId={dayData.lesson.id}
                  />
                </div>
              ) : (
                <div className="text-xs text-gray-400 italic">
                  Ders yok
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WeeklyView;