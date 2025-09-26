import React from 'react';
import { formatDate, formatTime } from '../utils/dateUtils';

const CancelledLessons = ({ cancelledLessons, onRescheduleLesson, onRestoreLesson }) => {
  if (cancelledLessons.length === 0) {
    return (
      <div className="card p-8 text-center">
        <div className="text-gray-500 mb-4">
          <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-800 mb-2">No Cancelled Lessons</h3>
        <p className="text-gray-600">All lessons are active and scheduled.</p>
      </div>
    );
  }

  return (
    <div className="card p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Cancelled Lessons ({cancelledLessons.length})
      </h3>
      <div className="space-y-3">
        {cancelledLessons.map((lesson) => (
          <div
            key={lesson.id}
            className="flex items-center space-x-4 p-4 rounded-lg border-2 border-red-200 bg-red-50"
          >
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onRestoreLesson(lesson.studentId, lesson.id)}
                className="w-8 h-8 rounded-full bg-green-500 hover:bg-green-600 text-white flex items-center justify-center transition-colors"
                title="Restore lesson"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
              
              <button
                onClick={() => onRescheduleLesson(lesson.studentId, lesson.id)}
                className="w-8 h-8 rounded-full bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center transition-colors"
                title="Reschedule lesson"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </button>
            </div>
            
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
            
            <div className="text-right">
              <div className="text-sm font-medium text-red-600">
                Cancelled
              </div>
              <div className="text-xs text-gray-500">
                {formatTime(lesson.time)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CancelledLessons;
