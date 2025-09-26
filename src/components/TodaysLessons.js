import React from 'react';
import { formatDate, formatTime } from '../utils/dateUtils';

const TodaysLessons = ({ todaysLessons, onToggleLesson, onToggleLessonCancellation }) => {
  if (todaysLessons.length === 0) {
    return (
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Bugünkü Dersler</h3>
        <div className="text-center py-8">
          <div className="text-gray-400 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-gray-500">Bugün için ders yok</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Bugünkü Dersler ({todaysLessons.length})
      </h3>
      <div className="space-y-3">
        {todaysLessons.map((lesson) => (
          <div
            key={lesson.id}
            className={`p-4 rounded-lg border-2 transition-all ${
              lesson.cancelled
                ? 'status-cancelled'
                : lesson.completed
                ? 'status-completed'
                : 'status-pending hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => onToggleLesson(lesson.studentId, lesson.id)}
                  className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${
                    lesson.completed
                      ? 'bg-green-500 border-green-500 text-white'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  disabled={lesson.cancelled}
                >
                  {lesson.completed && (
                    <span className="text-sm">✓</span>
                  )}
                </button>
                
                <button
                  onClick={() => onToggleLessonCancellation(lesson.studentId, lesson.id)}
                  className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${
                    lesson.cancelled
                      ? 'bg-red-500 border-red-500 text-white'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  title={lesson.cancelled ? 'İptali kaldır' : 'İptal et'}
                >
                  {lesson.cancelled && (
                    <span className="text-sm">✕</span>
                  )}
                </button>
              </div>
              
              <div className="flex-1 min-w-0 ml-3">
                <div className="flex items-center space-x-3">
                  <span className={`text-lg font-medium ${
                    lesson.cancelled ? 'text-red-600 line-through' : 'text-gray-900'
                  }`}>
                    {lesson.studentName}
                    {lesson.cancelled && ' (İptal)'}
                  </span>
                  <span className="text-sm text-gray-500">
                    {formatDate(lesson.date)}
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  {lesson.dayName} - {formatTime(lesson.time)}
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-sm font-medium text-gray-700">
                  {formatTime(lesson.time)}
                </div>
                <div className="text-xs text-gray-500">
                  {lesson.cancelled ? 'İptal' : lesson.completed ? 'Tamamlandı' : 'Bekliyor'}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TodaysLessons;