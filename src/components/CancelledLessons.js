import React from 'react';
import { formatDate, formatTime } from '../utils/dateUtils';

const CancelledLessons = ({ cancelledLessons, onRescheduleLesson, onRestoreLesson }) => {
  if (cancelledLessons.length === 0) {
    return (
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">İptal Edilen Dersler</h3>
        <div className="text-center py-8">
          <div className="text-gray-400 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <p className="text-gray-500">İptal edilen ders yok</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        İptal Edilen Dersler ({cancelledLessons.length})
      </h3>
      <div className="space-y-3">
        {cancelledLessons.map((lesson) => (
          <div
            key={lesson.id}
            className="p-4 rounded-lg border-2 status-cancelled"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-3">
                  <span className="text-lg font-medium text-red-600 line-through">
                    {lesson.studentName}
                  </span>
                  <span className="text-sm text-gray-500">
                    {formatDate(lesson.date)}
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  {lesson.dayName} - {formatTime(lesson.time)}
                </div>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => onRestoreLesson(lesson.studentId, lesson.id)}
                  className="btn btn-success text-sm"
                >
                  Geri Yükle
                </button>
                <button
                  onClick={() => onRescheduleLesson(lesson.studentId, lesson.id)}
                  className="btn btn-primary text-sm"
                >
                  Yeniden Planla
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CancelledLessons;